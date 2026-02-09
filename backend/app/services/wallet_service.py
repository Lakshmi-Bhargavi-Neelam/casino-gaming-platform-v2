from sqlalchemy.orm import Session
from sqlalchemy import desc, extract, cast, Date
from fastapi import HTTPException
from app.models.wallet import Wallet
from app.models.wallet_transaction import WalletTransaction
from app.models.transaction_type import TransactionType
from app.models.game_round import GameRound
from app.models.deposit import Deposit
from app.models.withdrawal import Withdrawal
from decimal import Decimal
import uuid


class WalletService:

    @staticmethod
    def _validate_reference(db: Session, ref_type: str, ref_id):
        """Ensure reference_id points to correct table."""
        if ref_type == "withdrawal_request" and ref_id is None:
            return

        if not ref_type or not ref_id:
            raise HTTPException(400, "Reference information required")

        if ref_type == "bet":
            exists = db.query(GameRound).filter_by(round_id=ref_id).first()
        elif ref_type == "deposit":
            exists = db.query(Deposit).filter_by(deposit_id=ref_id).first()
        elif ref_type in ["withdrawal", "withdrawal_rejection"]:
            exists = db.query(Withdrawal).filter_by(withdrawal_id=ref_id).first()
        
        elif ref_type in ["bonus", "bonus_conversion"]:
           return # Skip strict DB check for these since they point to Bonus table
        else:
            raise HTTPException(400, "Invalid reference type")

        if not exists:
            raise HTTPException(400, f"Invalid {ref_type} reference")

    @staticmethod
    def get_wallet(db: Session, player_id: uuid.UUID, wallet_type_code: str):
        wallet = (
            db.query(Wallet)
            .join(Wallet.wallet_type)
            .filter(
                Wallet.player_id == player_id,
                Wallet.wallet_type.has(wallet_type_code=wallet_type_code),
                Wallet.is_active == True,
            )
            .with_for_update()
            .first()
        )

        if not wallet:
            raise HTTPException(404, f"{wallet_type_code} wallet not found")

        return wallet

    @staticmethod
    def apply_transaction(
        db: Session,
        wallet: Wallet,
        amount: float,
        txn_code: str,
        ref_type=None,
        ref_id=None,
    ):
        amount_dec = Decimal(str(amount))
        txn_type = db.query(TransactionType).filter_by(transaction_code=txn_code).first()

        if not txn_type:
            raise HTTPException(400, "Invalid transaction type")

        WalletService._validate_reference(db, ref_type, ref_id)

        balance_before = wallet.balance

        if txn_type.direction == "debit":
            if wallet.balance < amount_dec:
                raise HTTPException(400, "Insufficient balance")
            wallet.balance -= amount_dec
            signed_amount = -amount_dec
        else:
            wallet.balance += amount_dec
            signed_amount = amount_dec

        txn = WalletTransaction(
            wallet_id=wallet.wallet_id,
            transaction_type_id=txn_type.transaction_type_id,
            amount=signed_amount,
            balance_before=balance_before,
            balance_after=wallet.balance,
            reference_type=ref_type,
            reference_id=ref_id,
            status="success",
        )

        db.add(txn)
        return txn

    @staticmethod
    def get_wallet_dashboard(
        db: Session,
        player_id: uuid.UUID,
        tx_type: str = None,
        month: str = None,
    ):
        # Always fetch CASH wallet
        wallet = (
            db.query(Wallet)
            .join(Wallet.wallet_type)
            .filter(
                Wallet.player_id == player_id,
                Wallet.wallet_type.has(wallet_type_code="CASH"),
                Wallet.is_active == True,
            )
            .first()
        )

        if not wallet:
            return None

        query = db.query(WalletTransaction).filter(
            WalletTransaction.wallet_id == wallet.wallet_id
        )

        if tx_type:
            query = query.filter(WalletTransaction.reference_type == tx_type)

        if month and month not in ["", "month"]:
            try:
                if len(month) == 10:
                    query = query.filter(cast(WalletTransaction.created_at, Date) == month)
                elif len(month) == 7:
                    year, m = map(int, month.split("-"))
                    query = query.filter(
                        extract("year", WalletTransaction.created_at) == year,
                        extract("month", WalletTransaction.created_at) == m,
                    )
            except:
                pass

        transactions = (
            query.order_by(desc(WalletTransaction.created_at))
            .limit(50)
            .all()
        )

        return {
            "balance": float(wallet.balance),
            "transactions": [
                {
                    "id": str(t.transaction_id),
                    "amount": float(t.amount),
                    "type": t.reference_type,
                    "status": t.status,
                    "after": float(t.balance_after),
                    "date": t.created_at,
                }
                for t in transactions
            ],
        }
