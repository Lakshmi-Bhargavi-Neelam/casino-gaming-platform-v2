from datetime import datetime
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.deposit import Deposit
from app.services.wallet_service import WalletService


class DepositService:

    @staticmethod
    def complete_deposit(db: Session, deposit_id):
        deposit = db.query(Deposit).filter(Deposit.deposit_id == deposit_id).first()

        if not deposit or deposit.status != "pending":
            raise HTTPException(400, "Invalid deposit")

        wallet = WalletService.get_wallet(db, deposit.player_id, "CASH")

        WalletService.apply_transaction(
            db,
            wallet,
            deposit.amount,
            "deposit",
            ref_type="deposit",
            ref_id=deposit.deposit_id
        )

        deposit.status = "success"
        deposit.completed_at = datetime.utcnow()
