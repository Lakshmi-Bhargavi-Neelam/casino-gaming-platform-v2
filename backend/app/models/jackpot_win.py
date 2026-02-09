from sqlalchemy import Column, ForeignKey, Numeric, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from app.core.database import Base


class JackpotWin(Base):
    __tablename__ = "jackpot_wins"

    jackpot_win_id = Column(
        ForeignKey("jackpot_wins.jackpot_win_id"),
        primary_key=True,
        autoincrement=True
    )

    jackpot_id = Column(
        UUID(as_uuid=True),
        ForeignKey("jackpots.jackpot_id"),
        nullable=False
    )

    player_id = Column(
        UUID(as_uuid=True),
        ForeignKey("players.player_id"),
        nullable=False
    )

    # Can be NULL for FIXED / SPONSORED random draws
    bet_id = Column(
        UUID(as_uuid=True),
        ForeignKey("bets.bet_id"),
        nullable=True
    )

    win_amount = Column(Numeric(18, 2), nullable=False)

    won_at = Column(
        DateTime,
        server_default=func.now()
    )
