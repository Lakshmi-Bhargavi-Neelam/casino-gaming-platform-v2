from sqlalchemy.orm import Session
from sqlalchemy import desc, extract, cast, Date
from fastapi import HTTPException
from decimal import Decimal
import uuid
from app.services.analytics_service import AnalyticsService

from app.models.wallet import Wallet
from app.models.user import User
from app.models.country import Country
from app.models.wallet_transaction import WalletTransaction
from app.models.transaction_type import TransactionType
from app.models.game_round import GameRound
from app.models.deposit import Deposit
from app.models.withdrawal import Withdrawal


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

        # 🎯 Bonuses (skip strict FK check)
        elif ref_type in ["bonus", "bonus_conversion"]:
            return

        # 🎯 Jackpots (skip strict FK check)
        elif ref_type in ["jackpot", "jackpot_win"]:
            return

        else:
            raise HTTPException(400, f"Invalid reference type: {ref_type}")

        if not exists:
            raise HTTPException(400, f"Invalid {ref_type} reference")

    # ✅ FIXED INDENTATION
    @staticmethod
    def get_wallet(
        db: Session,
        player_id: uuid.UUID,
        wallet_type_code: str,
        tenant_id: uuid.UUID
    ):
        wallet = (
            db.query(Wallet)
            .join(Wallet.wallet_type)
            .filter(
                Wallet.player_id == player_id,
                Wallet.tenant_id == tenant_id,
                Wallet.wallet_type.has(wallet_type_code=wallet_type_code),
                Wallet.is_active.is_(True),
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

        txn_type = db.query(TransactionType).filter_by(
            transaction_code=txn_code
        ).first()

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
        tenant_id: uuid.UUID,
        tx_type: str = None,
        month: str = None,
    ):
        wallet = (
            db.query(Wallet)
            .join(Wallet.wallet_type)
            .filter(
                Wallet.player_id == player_id,
                Wallet.tenant_id == tenant_id,
                Wallet.wallet_type.has(wallet_type_code="CASH"),
                Wallet.is_active.is_(True),
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
                    query = query.filter(
                        cast(WalletTransaction.created_at, Date) == month
                    )

                elif len(month) == 7:
                    year, m = map(int, month.split("-"))
                    query = query.filter(
                        extract("year", WalletTransaction.created_at) == year,
                        extract("month", WalletTransaction.created_at) == m,
                    )
            except Exception:
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

    @staticmethod
    def init_tenant_profile(db: Session, player_id: uuid.UUID, tenant_id: uuid.UUID):
        """Initialize CASH & BONUS wallets for tenant context."""

        cash_wallet = db.query(Wallet).join(Wallet.wallet_type).filter(
            Wallet.player_id == player_id,
            Wallet.tenant_id == tenant_id,
            Wallet.wallet_type.has(wallet_type_code="CASH")
        ).first()

        if cash_wallet:
            return {"message": "Profile already exists"}

        user = db.query(User).filter(User.user_id == player_id).first()

        if not user:
            raise HTTPException(404, "User not found")

        country = db.query(Country).filter(
            Country.country_code == user.country_code
        ).first()

        if not country:
            raise HTTPException(400, "Invalid country configuration")

         # ─────────────────────────────
        # 🎯 ANALYTICS: Track New Registration
        # ─────────────────────────────
        # We can create a specific method in AnalyticsService to increment total_players_registered
        # For now, we can use a generic update to the snapshot
        stmt = insert(AnalyticsSnapshot).values(
            snapshot_date=date.today(),
            tenant_id=tenant_id,
            total_players_registered=1
        ).on_conflict_do_update(
            constraint="analytics_snapshots_snapshot_date_tenant_id_game_id_key",
            set_={"total_players_registered": AnalyticsSnapshot.total_players_registered + 1}
        )
        db.execute(stmt)

        db.add(Wallet(
            player_id=player_id,
            tenant_id=tenant_id,
            currency_id=country.default_currency_id,
            wallet_type_id=1,  # CASH
            balance=Decimal("0.00"),
            is_active=True
        ))

        db.add(Wallet(
            player_id=player_id,
            tenant_id=tenant_id,
            currency_id=None,
            wallet_type_id=2,  # BONUS
            balance=Decimal("0.00"),
            is_active=True
        ))

        db.commit()

        return {"message": "Tenant profile initialized successfully"}
