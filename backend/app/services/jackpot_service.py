from sqlalchemy.orm import Session
from decimal import Decimal # 🎯 1. Ensure this is imported at the top
from app.models.jackpot import Jackpot
from app.models.player import Player
from app.models.user import User  # 🎯 1. Add this import
from app.models.bet import Bet # 🎯 Add this to force-load the "bets" table mapping
from app.models.jackpot_win import JackpotWin # Ensure this is also here
from app.models.jackpot_contribution import JackpotContribution as ContributionModel
from app.services.wallet_service import WalletService
from fastapi import HTTPException
from datetime import datetime
import uuid
import random
from decimal import Decimal
from app.schemas.jackpot import JackpotCreate
from app.models.wallet import Wallet
from app.models.wallet_type import WalletType
from app.models.jackpot_win import JackpotWin 


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
            contribution_percentage=payload.contribution_percentage,
            opt_in_required=payload.opt_in_required,
            status="ACTIVE"
        )
        db.add(new_jackpot)
        db.commit()
        db.refresh(new_jackpot)
        return new_jackpot

    @staticmethod
    def contribute_to_sponsored(db: Session, player_id: uuid.UUID,tenant_id: uuid.UUID, jackpot_id: uuid.UUID, amount: float):
        jackpot = db.query(Jackpot).filter(Jackpot.jackpot_id == jackpot_id).first()

                # 🎯 FIX 1: Security Context Check
        if not jackpot or jackpot.tenant_id != tenant_id:
            raise HTTPException(400, "This jackpot does not belong to your current casino.")
        
        if jackpot.jackpot_type != "SPONSORED" or jackpot.status != "ACTIVE":
            raise HTTPException(400, "This jackpot is not open for contributions")
        
        now_local = datetime.now()
            
            # Simple direct comparison (Naive vs Naive)
        if now_local > jackpot.deadline:
            raise HTTPException(400, "The deadline for this jackpot has passed")

        # 🎯 FIX: Convert float to Decimal explicitly
        amount_dec = Decimal(str(amount))

        # 1. Deduct from Player CASH wallet
        wallet = WalletService.get_wallet(db, player_id, "CASH", tenant_id)
        
        WalletService.apply_transaction(
            db=db,
            wallet=wallet,
            amount=amount, # WalletService converts this internally, so float is fine here
            txn_code="jackpot_contribution", 
            ref_type="jackpot",
            ref_id=jackpot_id
        )

        # 2. Record the contribution
        contribution = ContributionModel(
            jackpot_id=jackpot_id,
            player_id=player_id,
            amount=amount_dec # Store as Decimal
        )
        db.add(contribution)

        # 3. Update the Live Jackpot Pool
        # 🎯 THIS WAS THE ERROR LINE: Now we add Decimal + Decimal
        jackpot.current_amount += amount_dec
        
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

        # 🎯 2. Select Winner based on Type
        
        if jackpot.jackpot_type == "FIXED":
            # 🎯 FIX: For FIXED, we pick from anyone who has "Entered" this casino.
            # We check the Wallet table because global players have User.tenant_id = NULL.
            players_in_casino = db.query(Wallet.player_id).filter(
                Wallet.tenant_id == jackpot.tenant_id,
                Wallet.is_active == True
            ).distinct().all()

            if not players_in_casino:
                raise HTTPException(status_code=404, detail="No players have joined this casino yet.")
            
            winner_id = random.choice(players_in_casino)[0]
            
        elif jackpot.jackpot_type in ["SPONSORED", "PROGRESSIVE"]:
            # 🎯 FOR PROGRESSIVE & SPONSORED:
            # We pick ONLY from players who actually paid into this specific pool.
            # This is the fairest way for Progressive (only opt-in players can win).
            contributors = db.query(ContributionModel.player_id).filter(
                ContributionModel.jackpot_id == jackpot_id
            ).distinct().all()
            
            if not contributors:
                # If it's Progressive and no one opted in yet, the pool can't be won.
                raise HTTPException(status_code=404, detail="No contributors found for this pool.")
            
            winner_id = random.choice(contributors)[0]

        # 3. Finalize the Win
        if winner_id:
            try:
                # A. Create Jackpot Win Record
                new_win = JackpotWin(
                    jackpot_id=jackpot_id,
                    player_id=winner_id,
                    win_amount=win_amount,
                    won_at=datetime.now()
                )
                db.add(new_win)

                # B. Credit Winner's CASH wallet for THIS tenant
                winner_wallet = WalletService.get_wallet(db, winner_id, "CASH", jackpot.tenant_id)
                WalletService.apply_transaction(
                    db=db,
                    wallet=winner_wallet,
                    amount=float(win_amount),
                    txn_code="jackpot_payout", 
                    ref_type="jackpot_win",
                    ref_id=jackpot_id
                )

                # C. Update Jackpot State
                jackpot.last_won_at = datetime.now()
                
                # Logic for status/reset
                if jackpot.jackpot_type == "PROGRESSIVE":
                    # 🎯 Progressive now becomes INACTIVE after one win
                    jackpot.status = "COMPLETED" 
                elif jackpot.jackpot_type == "SPONSORED" or jackpot.reset_cycle == "NEVER":
                    jackpot.status = "COMPLETED"
                    print(f"Jackpot {jackpot.jackpot_name} finalized as COMPLETED.")
                else:
                    # Recurring: Reset pool back to the starting seed for the next day/week
                    jackpot.current_amount = jackpot.seed_amount
                    jackpot.status = "ACTIVE"
                    print(f"Jackpot {jackpot.jackpot_name} reset to seed amount for next cycle.")

                db.commit()
                return {"winner_id": str(winner_id), "amount": float(win_amount)}

            except Exception as e:
                db.rollback()
                print(f"Error during jackpot draw: {e}")
                raise HTTPException(status_code=500, detail="Failed to process jackpot win")

        # Fallback error
        raise HTTPException(status_code=404, detail="Winner selection criteria not met")

    @staticmethod
    def process_progressive_bet(db: Session, 
    player_id: uuid.UUID, 
    tenant_id: uuid.UUID, 
    total_bet: float,
    bet_id: uuid.UUID):
        """
        Takes the total bet, splits it, updates the jackpot pool, 
        and returns the remaining amount for the game engine.
        """
        # 1. Find ACTIVE PROGRESSIVE Jackpot for this tenant
        jackpot = db.query(Jackpot).filter(
            Jackpot.tenant_id == tenant_id,
            Jackpot.jackpot_type == 'PROGRESSIVE',
            Jackpot.status == 'ACTIVE'
        ).first()

        # If user opted in but no jackpot exists, we just return full amount (or raise error)
        if not jackpot:
            # Option A: Fail strict
            # raise HTTPException(400, "No active progressive jackpot found.")
            # Option B: Play normally (safe fallback)
            return float(total_bet)

        # 2. Calculate the split
         # 🎯 FIX: Explicit Decimal conversion for the percentage
        total_dec = Decimal(str(total_bet))
        percent_dec = Decimal(str(jackpot.contribution_percentage or 0)) # Ensure it's not None
        
        # Calculate contribution (e.g. 1% of $100 = $1)
        contrib_amount = total_dec * (jackpot.contribution_percentage / 100)
        
        # Remaining stake for game (e.g. $99)
        game_stake = total_dec - contrib_amount

        # 3. Update Jackpot Pool
        jackpot.current_amount += contrib_amount

        # 4. Log Contribution (This marks player as eligible for this specific draw)
        # Note: We link this contribution to the 'bet' later in gameplay_service, 
        # but for now we just record the money movement.
        contribution = ContributionModel(
            jackpot_id=jackpot.jackpot_id,
            player_id=player_id,
            amount=contrib_amount,
            bet_id=bet_id # 🎯 This now correctly points to the 'bets' table

            # We will update bet_id later if needed, or leave null for pool tracking
        )
        db.add(contribution)

        return float(game_stake)