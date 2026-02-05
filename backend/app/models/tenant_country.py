import uuid
from sqlalchemy import Boolean, TIMESTAMP, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base

class TenantCountry(Base):
    __tablename__ = "tenant_countries"

    tenant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("tenants.tenant_id"), primary_key=True
    )
    country_code: Mapped[str] = mapped_column(
        ForeignKey("countries.country_code"), primary_key=True
    )

    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[str] = mapped_column(TIMESTAMP)
