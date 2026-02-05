import uuid
from datetime import datetime
from sqlalchemy import ForeignKey, Integer, Numeric, TIMESTAMP, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from sqlalchemy.dialects.postgresql import UUID, JSONB  # 👈 Added JSONB herefrom sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base



class GameRound(Base):
    __tablename__ = "game_rounds"

    round_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )

    session_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("game_sessions.session_id"),
        nullable=False
    )

    round_number: Mapped[int] = mapped_column(Integer, nullable=False)

    started_at: Mapped[datetime] = mapped_column(
        TIMESTAMP, default=datetime.utcnow
    )
    ended_at: Mapped[datetime | None] = mapped_column(TIMESTAMP)

    outcome: Mapped[str | None] = mapped_column(String(50))

    # 🔥 Added columns
    bet_amount: Mapped[float | None] = mapped_column(Numeric(18, 2))
    win_amount: Mapped[float | None] = mapped_column(Numeric(18, 2))

    result_data: Mapped[dict | None] = mapped_column(JSONB)

    # 1:1 Relationship with Bet
    bet = relationship("Bet", back_populates="round", uselist=False)

     # 🔥 NEW reverse relation
    wallet_transactions = relationship(
        "WalletTransaction",
        back_populates="game_round",
        cascade="all, delete-orphan",
    )
