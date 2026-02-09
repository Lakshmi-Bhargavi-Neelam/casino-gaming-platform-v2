# app/models/bonus_usage.py
from sqlalchemy import Column, String, Boolean, Numeric, Integer, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import Mapped, mapped_column, relationship

import uuid
from app.core.database import Base

class BonusUsage(Base):
    __tablename__ = "bonus_usage"

    bonus_usage_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    bonus_id = Column(UUID(as_uuid=True), ForeignKey("bonuses.bonus_id"), nullable=False)

    player_id = Column(UUID(as_uuid=True), nullable=False)
    wallet_id = Column(UUID(as_uuid=True), nullable=False)

    bonus_amount = Column(Numeric(18, 2), nullable=False)

    wagering_required = Column(Numeric(18, 2), nullable=False)
    wagering_completed = Column(Numeric(18, 2), default=0)

    status = Column(String(20), default="active")
    # active | eligible_for_conversion | completed | expired | cancelled

    granted_at = Column(DateTime, server_default=func.now())
    completed_at = Column(DateTime)
    expired_at = Column(DateTime)

    bonus = relationship("Bonus")

