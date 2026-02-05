from datetime import datetime
from decimal import Decimal
from sqlalchemy import Numeric, String, TIMESTAMP, ForeignKey, CheckConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import Base
import uuid


class WalletTransaction(Base):
    __tablename__ = "wallet_transactions"

    transaction_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )

    wallet_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("wallets.wallet_id")
    )

    transaction_type_id: Mapped[int | None] = mapped_column(
        ForeignKey("transaction_types.transaction_type_id")
    )

    amount: Mapped[Decimal] = mapped_column(Numeric(18, 2), nullable=False)
    balance_before: Mapped[Decimal] = mapped_column(Numeric(18, 2), nullable=False)
    balance_after: Mapped[Decimal] = mapped_column(Numeric(18, 2), nullable=False)

    reference_type: Mapped[str | None] = mapped_column(String(30))
    reference_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True))

    # 🔥 FK added here to match DB
    reference_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("game_rounds.round_id", ondelete="CASCADE"),
        nullable=True,
    )

    # ORM relationship to GameRound
    game_round = relationship(
        "GameRound",
        back_populates="wallet_transactions",
        foreign_keys=[reference_id],
    )

    status: Mapped[str] = mapped_column(
        String(20),
        default="success",
        nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP,
        default=datetime.utcnow
    )

    __table_args__ = (
        CheckConstraint(
            "status IN ('pending','success','failed','reversed')",
            name="wallet_transactions_status_check"
        ),
    )
