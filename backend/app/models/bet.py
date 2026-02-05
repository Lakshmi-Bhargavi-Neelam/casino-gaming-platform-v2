import uuid
from datetime import datetime
from sqlalchemy import ForeignKey, Numeric, String, TIMESTAMP, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base


class Bet(Base):
    __tablename__ = "bets"

    __table_args__ = (
        UniqueConstraint("round_id", name="unique_round_bet"),
    )

    bet_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )

    round_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("game_rounds.round_id"),
        nullable=False
    )

    wallet_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("wallets.wallet_id"),
        nullable=False
    )

    bet_amount: Mapped[float] = mapped_column(Numeric(18, 2), nullable=False)
    win_amount: Mapped[float] = mapped_column(Numeric(18, 2), default=0)

    bet_currency_id: Mapped[int] = mapped_column(
        ForeignKey("currencies.currency_id"),
        nullable=False
    )

    bet_status: Mapped[str] = mapped_column(
        String(20),
        default="placed"
    )

    placed_at: Mapped[datetime] = mapped_column(
        TIMESTAMP, default=datetime.utcnow
    )
    settled_at: Mapped[datetime | None] = mapped_column(TIMESTAMP)

    # Relationship back to GameRound
    round = relationship("GameRound", back_populates="bet")
