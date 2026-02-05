import uuid
from datetime import datetime
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.deposit import Deposit
from app.models.withdrawal import Withdrawal
from app.models.wallet import Wallet
from app.models.wallet_transaction import WalletTransaction
from app.models.transaction_type import TransactionType


class PaymentService:

    # 🔹 Helper to fetch transaction type
    @staticmethod
    def get_txn_type(db: Session, code: str) -> int:
        txn_type = db.query(TransactionType).filter(
            TransactionType.transaction_code == code
        ).first()

        if not txn_type:
            raise HTTPException(500, f"Transaction type '{code}' not configured")

        return txn_type.transaction_type_id

    # 💰 COMPLETE DEPOSIT (Gateway Success Callback)
    @staticmethod
    def complete_deposit(db: Session, deposit_id: uuid.UUID):
        try:
            deposit = db.query(Deposit).filter(
                Deposit.deposit_id == deposit_id
            ).first()

            if not deposit or deposit.status != "pending":
                raise HTTPException(400, "Deposit already processed")

            wallet = db.query(Wallet).filter(
                Wallet.wallet_id == deposit.wallet_id
            ).with_for_update().first()

            if not wallet:
                raise HTTPException(404, "Wallet not found")

            balance_before = wallet.balance
            wallet.balance += deposit.amount

            txn = WalletTransaction(
                wallet_id=wallet.wallet_id,
                transaction_type_id=PaymentService.get_txn_type(db, "deposit"),
                amount=deposit.amount,
                balance_before=balance_before,
                balance_after=wallet.balance,
                reference_type="deposit",
                reference_id=deposit.deposit_id,
                status="success"
            )

            deposit.status = "success"
            deposit.completed_at = datetime.utcnow()

            db.add(txn)
            db.commit()

        except Exception as e:
            db.rollback()
            raise e

    # 💸 PLAYER REQUEST WITHDRAWAL
    @staticmethod
    def request_withdrawal(db: Session, player_id: uuid.UUID, wallet_id: uuid.UUID, amount: float, tenant_id: uuid.UUID):
        wallet = db.query(Wallet).filter(
            Wallet.wallet_id == wallet_id,
            Wallet.player_id == player_id
        ).with_for_update().first()

        if not wallet:
            raise HTTPException(404, "Wallet not found")

        if wallet.balance < amount:
            raise HTTPException(400, "Insufficient balance")

        withdrawal = Withdrawal(
            player_id=player_id,
            wallet_id=wallet_id,
            tenant_id=tenant_id,
            amount=amount,
            currency_id=wallet.currency_id
        )

        db.add(withdrawal)
        db.commit()
        return withdrawal

    # 🏦 ADMIN APPROVES WITHDRAWAL
    @staticmethod
    def approve_withdrawal(db: Session, withdrawal_id: uuid.UUID):
        try:
            withdrawal = db.query(Withdrawal).filter(
                Withdrawal.withdrawal_id == withdrawal_id
            ).first()

            if not withdrawal or withdrawal.status != "requested":
                raise HTTPException(400, "Invalid withdrawal state")

            wallet = db.query(Wallet).filter(
                Wallet.wallet_id == withdrawal.wallet_id
            ).with_for_update().first()

            if not wallet:
                raise HTTPException(404, "Wallet not found")

            balance_before = wallet.balance
            wallet.balance -= withdrawal.amount

            txn = WalletTransaction(
                wallet_id=wallet.wallet_id,
                transaction_type_id=PaymentService.get_txn_type(db, "withdrawal"),
                amount=withdrawal.amount,
                balance_before=balance_before,
                balance_after=wallet.balance,
                reference_type="withdrawal",
                reference_id=withdrawal.withdrawal_id,
                status="success"
            )

            withdrawal.status = "approved"
            withdrawal.processed_at = datetime.utcnow()

            db.add(txn)
            db.commit()

        except Exception as e:
            db.rollback()
            raise e
