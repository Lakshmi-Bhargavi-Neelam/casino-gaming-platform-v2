from sqlalchemy.orm import Session
from app.models.jackpot import Jackpot
from app.models.jackpot_contribution import JackpotContribution as ContributionModel
from app.services.wallet_service import WalletService
from fastapi import HTTPException
from datetime import datetime
import uuid
from app.schemas.jackpot import JackpotCreate


class JackpotService:

    @staticmethod
    def create_jackpot(db: Session, tenant_id: uuid.UUID, payload: JackpotCreate):
        # Initial current_amount is same as seed_amount
        new_jackpot = Jackpot(
            tenant_id=tenant_id,
            jackpot_name=payload.jackpot_name,
            jackpot_type=payload.jackpot_type,
            currency_id=payload.currency_id,
            seed_amount=payload.seed_amount,
            current_amount=payload.seed_amount,
            reset_cycle=payload.reset_cycle,
            deadline=payload.deadline,
            status="ACTIVE"
        )
        db.add(new_jackpot)
        db.commit()
        db.refresh(new_jackpot)
        return new_jackpot

    @staticmethod
    def contribute_to_sponsored(db: Session, player_id: uuid.UUID, jackpot_id: uuid.UUID, amount: float):
        jackpot = db.query(Jackpot).filter(Jackpot.jackpot_id == jackpot_id).first()
        
        if not jackpot or jackpot.jackpot_type != "SPONSORED" or jackpot.status != "ACTIVE":
            raise HTTPException(400, "This jackpot is not open for contributions")
        
        if jackpot.deadline and datetime.utcnow() > jackpot.deadline:
            raise HTTPException(400, "The deadline for this jackpot has passed")

        # 1. Deduct from Player CASH wallet
        wallet = WalletService.get_wallet(db, player_id, "CASH")
        # Ensure your WalletService has a 'jackpot_contribution' txn type code
        WalletService.apply_transaction(
            db=db,
            wallet=wallet,
            amount=amount,
            txn_code="jackpot_contribution", 
            ref_type="jackpot",
            ref_id=jackpot_id
        )

        # 2. Record the contribution
        contribution = ContributionModel(
            jackpot_id=jackpot_id,
            player_id=player_id,
            amount=amount
        )
        db.add(contribution)

        # 3. Update the Live Jackpot Pool
        jackpot.current_amount += amount
        
        db.commit()
        return {"message": "Contribution successful", "new_pool_total": float(jackpot.current_amount)}

    @staticmethod
    def draw_winner(db: Session, jackpot_id: uuid.UUID):
        # 1. Fetch Jackpot details
        jackpot = db.query(Jackpot).filter(Jackpot.jackpot_id == jackpot_id).first()
        
        if not jackpot or jackpot.status != "ACTIVE":
            raise HTTPException(status_code=400, detail="Jackpot is not active or not found")

        winner_id = None
        win_amount = jackpot.current_amount

        # 2. Logic to select the winner based on type
        if jackpot.jackpot_type == "FIXED":
            # Pick any random player belonging to this tenant
            players = db.query(Player).filter(Player.tenant_id == jackpot.tenant_id).all()
            if not players:
                raise HTTPException(status_code=404, detail="No eligible players found for this tenant")
            winner_id = random.choice(players).player_id
            
        elif jackpot.jackpot_type == "SPONSORED":
            # Pick only from people who actually contributed money to this pool
            contributors = db.query(JackpotContribution.player_id).filter(
                JackpotContribution.jackpot_id == jackpot_id
            ).distinct().all()
            
            if not contributors:
                raise HTTPException(status_code=404, detail="No contributors found for this sponsored jackpot")
            
            # contributors is a list of tuples like [ (uuid,), (uuid,) ]
            winner_id = random.choice(contributors)[0]

        # 3. Finalize the Win
        if winner_id:
            try:
                # A. Create Jackpot Win Record
                new_win = JackpotWin(
                    jackpot_id=jackpot_id,
                    player_id=winner_id,
                    win_amount=win_amount,
                    won_at=datetime.utcnow()
                )
                db.add(new_win)

                # B. Credit Winner's CASH wallet
                winner_wallet = WalletService.get_wallet(db, winner_id, "CASH")
                WalletService.apply_transaction(
                    db=db,
                    wallet=winner_wallet,
                    amount=float(win_amount),
                    txn_code="jackpot_payout", # Ensure this code exists in transaction_types
                    ref_type="jackpot_win",
                    ref_id=jackpot_id
                )

                # C. Update Jackpot State
                jackpot.last_won_at = datetime.utcnow()
                
                # If SPONSORED, we mark it as COMPLETED so no one else can contribute
                if jackpot.jackpot_type == "SPONSORED":
                    jackpot.status = "COMPLETED"
                else:
                    # If FIXED, reset the pool back to seed amount for the next cycle
                    jackpot.current_amount = jackpot.seed_amount

                db.commit()
                return {"winner_id": str(winner_id), "amount": float(win_amount)}

            except Exception as e:
                db.rollback()
                print(f"Error during jackpot draw: {e}")
                raise HTTPException(status_code=500, detail="Failed to process jackpot win")

        return None