# app/models/bonus.py
from sqlalchemy import Column, String, Boolean, Numeric, Integer, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from sqlalchemy import Enum 
from app.core.database import Base

class Bonus(Base):
    __tablename__ = "bonuses"

    bonus_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), nullable=False)

    bonus_name = Column(String(100), nullable=False)
    bonus_type = Column(Enum("DEPOSIT", "FIXED_CREDIT", name="bonus_type_enum")
)

    bonus_amount = Column(Numeric(18, 2))
    bonus_percentage = Column(Numeric(5, 2))
    max_bonus_amount = Column(Numeric(18, 2))

    wagering_multiplier = Column(Integer, nullable=False)
    min_deposit_amount = Column(Numeric(18, 2))

    max_uses_per_player = Column(Integer, default=1)
    is_active = Column(Boolean, default=True)

    valid_from = Column(DateTime, nullable=False)
    valid_to = Column(DateTime, nullable=False)

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
