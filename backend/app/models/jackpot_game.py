from sqlalchemy import Column, ForeignKey, PrimaryKeyConstraint
from sqlalchemy.dialects.postgresql import UUID
import uuid

from app.core.database import Base


class JackpotGame(Base):
    __tablename__ = "jackpot_games"

    jackpot_id = Column(
        UUID(as_uuid=True),
        ForeignKey("jackpots.jackpot_id", ondelete="CASCADE"),
        nullable=False
    )

    game_id = Column(
        UUID(as_uuid=True),
        ForeignKey("games.game_id", ondelete="CASCADE"),
        nullable=False
    )

    __table_args__ = (
        PrimaryKeyConstraint("jackpot_id", "game_id"),
    )
