import uuid
from sqlalchemy import Boolean, Numeric, TIMESTAMP, ForeignKey, Date
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base
from sqlalchemy.orm import relationship
from sqlalchemy import String


class TenantGame(Base):
    __tablename__ = "tenant_games"

    tenant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("tenants.tenant_id"),
        primary_key=True
    )

    game_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("games.game_id"),
        primary_key=True
    )

    # Tenant-specific configuration
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    launch_date: Mapped[str | None] = mapped_column(Date)

    min_bet: Mapped[float | None] = mapped_column(Numeric(12, 2))
    max_bet: Mapped[float | None] = mapped_column(Numeric(12, 2))
    rtp_override: Mapped[float | None] = mapped_column(Numeric(5, 2))

    revenue_share: Mapped[float | None] = mapped_column(Numeric(5, 2))

    status = mapped_column(String(20), default="active")

    created_at: Mapped[str] = mapped_column(TIMESTAMP)
    updated_at: Mapped[str] = mapped_column(TIMESTAMP)

    game = relationship("Game", back_populates="tenant_links")
    tenant = relationship("Tenant", back_populates="game_links")
