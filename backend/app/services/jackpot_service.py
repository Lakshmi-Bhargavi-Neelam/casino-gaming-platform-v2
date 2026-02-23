from sqlalchemy.orm import Session
from decimal import Decimal
from app.models.jackpot import Jackpot
from app.models.player import Player
from app.models.user import User
from app.models.bet import Bet
from app.models.jackpot_win import JackpotWin
from app.models.jackpot_contribution import JackpotContribution as ContributionModel
from app.services.wallet_service import WalletService
from fastapi import HTTPException
from datetime import datetime
import uuid
import random

from app.schemas.jackpot import JackpotCreate
from app.models.wallet import Wallet
from app.models.wallet_type import WalletType


class JackpotService:

    @staticmethod
    def create_jackpot(db: Session, tenant_id: uuid.UUID, payload: JackpotCreate):
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
    def contribute_to_sponsored(
        db: Session,
        player_id: uuid.UUID,
        tenant_id: uuid.UUID,
        jackpot_id: uuid.UUID,
        amount: float
    ):
        jackpot = db.query(Jackpot).filter(Jackpot.jackpot_id == jackpot_id).first()

        if not jackpot or jackpot.tenant_id != tenant_id:
            raise HTTPException(400, "This jackpot does not belong to your current casino.")
        
        if jackpot.jackpot_type != "SPONSORED" or jackpot.status != "ACTIVE":
            raise HTTPException(400, "This jackpot is not open for contributions")
        
        now_local = datetime.now()
        if now_local > jackpot.deadline:
            raise HTTPException(400, "The deadline for this jackpot has passed")

        amount_dec = Decimal(str(amount))

        wallet = WalletService.get_wallet(db, player_id, "CASH", tenant_id)
        
        WalletService.apply_transaction(
            db=db,
            wallet=wallet,
            amount=amount,
            txn_code="jackpot_contribution",
            ref_type="jackpot",
            ref_id=jackpot_id
        )

        contribution = ContributionModel(
            jackpot_id=jackpot_id,
            player_id=player_id,
            amount=amount_dec
        )
        db.add(contribution)

        jackpot.current_amount += amount_dec
        
        db.commit()
        return {
            "message": "Contribution successful",
            "new_pool_total": float(jackpot.current_amount)
        }

    @staticmethod
    def draw_winner(db: Session, jackpot_id: uuid.UUID):
        jackpot = db.query(Jackpot).filter(Jackpot.jackpot_id == jackpot_id).first()
        
        if not jackpot or jackpot.status != "ACTIVE":
            raise HTTPException(status_code=400, detail="Jackpot is not active or not found")

        winner_id = None
        win_amount = jackpot.current_amount
        
        if jackpot.jackpot_type == "FIXED":
            players_in_casino = db.query(Wallet.player_id).filter(
                Wallet.tenant_id == jackpot.tenant_id,
                Wallet.is_active == True
            ).distinct().all()

            if not players_in_casino:
                raise HTTPException(status_code=404, detail="No players found.")
            
            winner_id = random.choice(players_in_casino)[0]
            
        elif jackpot.jackpot_type in ["SPONSORED", "PROGRESSIVE"]:
            contributors = db.query(ContributionModel.player_id).filter(
                ContributionModel.jackpot_id == jackpot_id
            ).distinct().all()
            
            if not contributors:
                raise HTTPException(status_code=404, detail="No contributors found.")
            
            winner_id = random.choice(contributors)[0]

        if winner_id:
            try:
                new_win = JackpotWin(
                    jackpot_id=jackpot_id,
                    player_id=winner_id,
                    win_amount=win_amount,
                    won_at=datetime.now()
                )
                db.add(new_win)

                winner_wallet = WalletService.get_wallet(db, winner_id, "CASH", jackpot.tenant_id)
                WalletService.apply_transaction(
                    db=db,
                    wallet=winner_wallet,
                    amount=float(win_amount),
                    txn_code="jackpot_payout",
                    ref_type="jackpot_win",
                    ref_id=jackpot_id
                )

                jackpot.last_won_at = datetime.now()
                
                if jackpot.jackpot_type == "PROGRESSIVE":
                    jackpot.status = "COMPLETED"
                elif jackpot.jackpot_type == "SPONSORED" or jackpot.reset_cycle == "NEVER":
                    jackpot.status = "COMPLETED"
                else:
                    jackpot.current_amount = jackpot.seed_amount
                    jackpot.status = "ACTIVE"

                db.commit()
                return {"winner_id": str(winner_id), "amount": float(win_amount)}

            except Exception:
                db.rollback()
                raise HTTPException(status_code=500, detail="Failed to process jackpot win")

        raise HTTPException(status_code=404, detail="Winner selection criteria not met")

    @staticmethod
    def process_progressive_bet(
        db: Session,
        player_id: uuid.UUID,
        tenant_id: uuid.UUID,
        total_bet: float,
        bet_id: uuid.UUID
    ):
        jackpot = db.query(Jackpot).filter(
            Jackpot.tenant_id == tenant_id,
            Jackpot.jackpot_type == 'PROGRESSIVE',
            Jackpot.status == 'ACTIVE'
        ).first()

        if not jackpot:
            return float(total_bet)

        total_dec = Decimal(str(total_bet))
        percent_dec = Decimal(str(jackpot.contribution_percentage or 0))
        
        contrib_amount = total_dec * (percent_dec / Decimal("100"))
        game_stake = total_dec - contrib_amount

        jackpot.current_amount += contrib_amount

        contribution = ContributionModel(
            jackpot_id=jackpot.jackpot_id,
            player_id=player_id,
            amount=contrib_amount,
            bet_id=bet_id
        )
        db.add(contribution)

        return float(game_stake)