from sqlalchemy import Column, ForeignKey, Numeric, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from app.models.base import Base 


class JackpotContribution(Base):
    __tablename__ = "jackpot_contributions"

    contribution_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)


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

    # Can be NULL for sponsored voluntary contributions
    bet_id = Column(
        UUID(as_uuid=True),
        ForeignKey("bets.bet_id"),
        nullable=True
    )

    amount = Column(Numeric(18, 2), nullable=False)

    contributed_at = Column(
        DateTime,
        server_default=func.now()
    )
