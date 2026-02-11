from datetime import datetime
from sqlalchemy.orm import Session
from fastapi import HTTPException
import uuid
from app.models.withdrawal import Withdrawal
from app.models.wallet import Wallet
from app.models.player import Player
from app.services.wallet_service import WalletService
from decimal import Decimal


class WithdrawalService:


    @staticmethod
    def create_request(db: Session, user_id: uuid.UUID, tenant_id: uuid.UUID, amount: float):
        # 🎯 1. Fetch the specific CASH wallet for this tenant first
        # We need this to get the wallet_id and currency_id required by the DB
        wallet = WalletService.get_wallet(db, user_id, "CASH", tenant_id)

        if not wallet:
            raise HTTPException(status_code=404, detail="CASH wallet for this casino not found")

        # 2. Balance check
        amount_dec = Decimal(str(amount))
        if wallet.balance < amount_dec:
            raise HTTPException(status_code=400, detail="Insufficient balance in this casino wallet")

        # 🎯 3. Create the Withdrawal record with the required Foreign Keys
        new_withdrawal = Withdrawal(
            player_id=user_id,
            tenant_id=tenant_id,
            wallet_id=wallet.wallet_id,      # 👈 Added: Satisfies NotNullViolation
            currency_id=wallet.currency_id,  # 👈 Added: Keeps financial records accurate
            amount=amount_dec,
            status="requested",
            requested_at=datetime.utcnow()
        )
        
        db.add(new_withdrawal)
        
        # 4. Flush to generate the withdrawal_id for the transaction reference
        db.flush() 

        # 5. Apply the Wallet Transaction (Debit)
        # Link the transaction to this withdrawal record
        WalletService.apply_transaction(
            db=db,
            wallet=wallet,
            amount=float(amount),
            txn_code="withdrawal_request", 
            ref_type="withdrawal",         
            ref_id=new_withdrawal.withdrawal_id 
        )

        return new_withdrawal

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