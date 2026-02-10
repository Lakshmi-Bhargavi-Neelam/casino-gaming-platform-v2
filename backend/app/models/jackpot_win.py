from sqlalchemy import Column, ForeignKey, Numeric, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base 
import uuid


class JackpotWin(Base):
    __tablename__ = "jackpot_wins"

    jackpot_win_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)


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

    player_id = Column(UUID(as_uuid=True), ForeignKey("players.player_id"), nullable=False)
    # 🎯 ADD THESE RELATIONSHIPS
    jackpot = relationship("Jackpot")
    
    # This assumes Player and User share the same ID (1-to-1)
    # We map 'user' to the User model using the player_id foreign key
    user = relationship("User", primaryjoin="JackpotWin.player_id==User.user_id", foreign_keys=[player_id])


