import uuid
from datetime import datetime
from sqlalchemy import (
    Column,
    Integer,
    Numeric,
    Date,
    DateTime,
    Boolean,
    ForeignKey
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.core.database import Base


class ResponsibleLimit(Base):
    __tablename__ = "responsible_limits"

    limit_id = Column(Integer, primary_key=True, index=True)

    player_id = Column(
        UUID(as_uuid=True),
        ForeignKey("players.player_id"),
        nullable=False,
        index=True
    )

    tenant_id = Column(
        UUID(as_uuid=True),
        nullable=False,
        index=True
    )

    # 🎯 Deposit limits
    daily_deposit_limit = Column(Numeric(14, 2), nullable=True)

    # 🎯 Bet limits
    daily_bet_limit = Column(Numeric(14, 2), nullable=True)
    monthly_bet_limit = Column(Numeric(14, 2), nullable=True)

    # 🎯 Loss limit
    daily_loss_limit = Column(Numeric(14, 2), nullable=True)

    # 🎯 Session control
    session_limit_minutes = Column(Integer, default=180)

    # 🎯 Exclusion controls
    self_exclusion_until = Column(Date, nullable=True)
    cool_off_until = Column(DateTime, nullable=True)

    # 🎯 Status
    is_active = Column(Boolean, default=True)

    # 🎯 Timestamps
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
