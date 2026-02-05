import uuid
from datetime import date
from sqlalchemy import Boolean, Date, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import Base


class TenantProvider(Base):
    __tablename__ = "tenant_providers"

    tenant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("tenants.tenant_id", ondelete="CASCADE"),
        primary_key=True
    )

    provider_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("game_providers.provider_id", ondelete="CASCADE"),
        primary_key=True
    )

    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    contract_start: Mapped[date | None] = mapped_column(Date)
    contract_end: Mapped[date | None] = mapped_column(Date)
