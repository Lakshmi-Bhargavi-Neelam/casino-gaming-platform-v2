# app/models/player_limit.py
from sqlalchemy import Column, String, Boolean, Numeric, Integer, DateTime, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
from app.models.base import Base
from app.models.player import Player

player = relationship(Player, backref="limits")


class PlayerLimit(Base):
    """Responsible Gaming Limits set by players."""
    __tablename__ = "player_limits"

    limit_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Multi-tenant isolation
    player_id = Column(UUID(as_uuid=True), ForeignKey("players.player_id"), nullable=False)
    tenant_id = Column(UUID(as_uuid=True), nullable=False)

    # Limit Types: DEPOSIT, LOSS, SESSION, WAGER
    limit_type = Column(
        Enum("DEPOSIT", "LOSS", "SESSION", "WAGER", name="limit_type_enum"),
        nullable=False
    )

    # Limit value (amount in currency or minutes for session)
    limit_value = Column(Numeric(18, 2), nullable=False)

    # Time period: DAILY, WEEKLY, MONTHLY
    period = Column(
        Enum("DAILY", "WEEKLY", "MONTHLY", name="limit_period_enum"),
        nullable=False,
        default="DAILY"
    )

    # Status: ACTIVE, PENDING_INCREASE, EXPIRED, CANCELLED
    status = Column(
        Enum("ACTIVE", "PENDING_INCREASE", "EXPIRED", "CANCELLED", name="limit_status_enum"),
        nullable=False,
        default="ACTIVE"
    )

    # For tracking usage within the period
    current_usage = Column(Numeric(18, 2), default=0)

    # When the limit becomes effective (immediate for reductions, delayed for increases)
    effective_at = Column(DateTime, nullable=False)

    # When this limit was requested (for pending increases)
    requested_at = Column(DateTime, server_default=func.now())

    # Period tracking
    period_start = Column(DateTime, nullable=True)

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    player = relationship(Player, backref="limits")