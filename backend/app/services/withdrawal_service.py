from datetime import datetime
from sqlalchemy.orm import Session
from fastapi import HTTPException
import uuid
from app.models.withdrawal import Withdrawal
from app.services.wallet_service import WalletService

class WithdrawalService:
    @staticmethod
    def create_request(db: Session, user_id, tenant_id, amount):
        wallet = WalletService.get_wallet(db, user_id, "CASH")
        
        if wallet.balance < amount:
            raise HTTPException(400, "Insufficient balance")

        # 1. Deduct money IMMEDIATELY (Locks the funds)
        WalletService.apply_transaction(
            db=db,
            wallet=wallet,
            amount=amount,
            txn_code="withdrawal_request", # Status: Success (Money is gone from balance)
            ref_type="withdrawal",
            ref_id=None
        )

        # 2. Create the record for Admin review
        withdrawal = Withdrawal(
            player_id=user_id,
            tenant_id=tenant_id,
            wallet_id=wallet.wallet_id,
            amount=amount,
            currency_id=wallet.currency_id,
            status="requested"
        )
        db.add(withdrawal)
        return withdrawal

    @staticmethod
    def approve_withdrawal(db: Session, withdrawal_id: uuid.UUID):
        withdrawal = db.query(Withdrawal).filter(
            Withdrawal.withdrawal_id == withdrawal_id,
            Withdrawal.status == "requested"
        ).first()

        if not withdrawal:
            raise HTTPException(404, "Requested withdrawal not found")

        # 🎯 LOGIC FIX: Do NOT call apply_transaction here. 
        # The money was already deducted in create_request.
        withdrawal.status = "completed"
        withdrawal.processed_at = datetime.utcnow()
        return withdrawal

    @staticmethod
    def reject_withdrawal(db: Session, withdrawal_id):
        withdrawal = db.query(Withdrawal).filter(
            Withdrawal.withdrawal_id == withdrawal_id,
            Withdrawal.status == "requested"
        ).first()

        if not withdrawal:
            raise HTTPException(400, "Invalid withdrawal request")

        # 🎯 REFUND: Give the money back because the admin said NO
        wallet = WalletService.get_wallet(db, withdrawal.player_id, "CASH")
        WalletService.apply_transaction(
            db=db,
            wallet=wallet,
            amount=withdrawal.amount,
            txn_code="withdrawal_refund", # Direction: credit
            ref_type="withdrawal_rejection",
            ref_id=withdrawal.withdrawal_id
        )

        withdrawal.status = "rejected"
        withdrawal.processed_at = datetime.utcnow()
        return withdrawal