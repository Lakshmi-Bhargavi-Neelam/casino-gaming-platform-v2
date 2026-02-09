from sqlalchemy import Column, String, Boolean, Integer, Numeric, DateTime, ForeignKey, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid

# 🎯 CRITICAL: Ensure you import Base from the SAME file as all other models
from app.models.base import Base 

class Jackpot(Base):
    __tablename__ = "jackpots"

    jackpot_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # 🎯 Corrected: Single definitions for Foreign Keys
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.tenant_id"), nullable=False)
    currency_id = Column(Integer, ForeignKey("currencies.currency_id"), nullable=False)

    jackpot_name = Column(String(100), nullable=False)

    # 🎯 Corrected: CheckConstraints are best placed in __table_args__
    jackpot_type = Column(String(20), nullable=False)
    status = Column(String(20), default="ACTIVE")
    reset_cycle = Column(String(20), nullable=True)

    seed_amount = Column(Numeric(18, 2), nullable=False, default=0)
    current_amount = Column(Numeric(18, 2), nullable=False, default=0)

    # Progressive specific
    contribution_percentage = Column(Numeric(5, 2), default=0)
    opt_in_required = Column(Boolean, default=False)

    deadline = Column(DateTime, nullable=True)
    last_won_at = Column(DateTime, nullable=True)

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Optional: Table-level constraints
    __table_args__ = (
        CheckConstraint(
            "jackpot_type IN ('FIXED', 'PROGRESSIVE', 'SPONSORED')", 
            name="jackpot_type_check"
        ),
        CheckConstraint(
            "status IN ('ACTIVE', 'PAUSED', 'COMPLETED')", 
            name="jackpot_status_check"
        ),
        CheckConstraint(
            "reset_cycle IN ('DAILY', 'WEEKLY', 'MONTHLY', 'NEVER') OR reset_cycle IS NULL", 
            name="reset_cycle_check"
        ),
    )