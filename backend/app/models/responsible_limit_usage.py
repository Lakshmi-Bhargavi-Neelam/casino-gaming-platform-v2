from sqlalchemy import (
    Column,
    Integer,
    Numeric,
    Date,
    UniqueConstraint
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.core.database import Base


class ResponsibleLimitUsage(Base):
    __tablename__ = "responsible_limit_usage"

    usage_id = Column(Integer, primary_key=True, index=True)

    player_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    tenant_id = Column(UUID(as_uuid=True), nullable=False, index=True)

    usage_date = Column(Date, nullable=False)

    total_deposit = Column(Numeric(14, 2), default=0)
    total_bet = Column(Numeric(14, 2), default=0)
    total_loss = Column(Numeric(14, 2), default=0)

    __table_args__ = (
        UniqueConstraint(
            "player_id",
            "tenant_id",
            "usage_date",
            name="uq_player_tenant_usage_date"
        ),
    )
