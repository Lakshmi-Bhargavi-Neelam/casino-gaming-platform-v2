import uuid
from datetime import date
from sqlalchemy import Column, String, Integer, Numeric, Date, TIMESTAMP, ForeignKey, UniqueConstraint, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base

class AnalyticsSnapshot(Base):
    __tablename__ = "analytics_snapshots"

    snapshot_id = Column(Integer, primary_key=True, autoincrement=True)
    snapshot_date = Column(Date, nullable=False, server_default=text("CURRENT_DATE"))
    
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.tenant_id"), nullable=False)
    provider_id = Column(UUID(as_uuid=True), ForeignKey("game_providers.provider_id"), nullable=True)
    game_id = Column(UUID(as_uuid=True), ForeignKey("games.game_id"), nullable=True)
    country_code = Column(String(2), nullable=True)

    # Financial Metrics
    total_bets = Column(Numeric(18, 2), default=0)
    total_wins = Column(Numeric(18, 2), default=0)
    total_deposits = Column(Numeric(18, 2), default=0)
    total_withdrawals = Column(Numeric(18, 2), default=0)

    # Promotion Metrics
    total_bonus_issued = Column(Numeric(18, 2), default=0)
    total_bonus_converted = Column(Numeric(18, 2), default=0)

    # KPIs
    ggr = Column(Numeric(18, 2), default=0)
    rtp_percentage = Column(Numeric(5, 2), default=0)
    active_players_count = Column(Integer, default=0)

    created_at = Column(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP"))
    updated_at = Column(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP"), onupdate=text("CURRENT_TIMESTAMP"))

    # 🎯 Constraint matching your SQL
    __table_args__ = (
        UniqueConstraint('snapshot_date', 'tenant_id', 'game_id', name='idx_daily_tenant_game_stats'),
    )

    # Relationships for easy Dashboard Joins
    tenant = relationship("Tenant")
    game = relationship("Game")