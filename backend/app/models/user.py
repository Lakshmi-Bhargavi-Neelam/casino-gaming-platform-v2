import uuid
from datetime import datetime

from sqlalchemy import String, TIMESTAMP, ForeignKey, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class User(Base):
    __tablename__ = "users"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    first_name: Mapped[str | None] = mapped_column(String(100))
    last_name: Mapped[str | None] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(nullable=False)

    role_id: Mapped[int] = mapped_column(
        ForeignKey("roles.role_id"),
        nullable=False
    )

    tenant_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("tenants.tenant_id")
    )

    country_code: Mapped[str | None] = mapped_column(
        ForeignKey("countries.country_code")
    )

    status: Mapped[str] = mapped_column(String(20), default="active")

    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP,
        server_default=text("CURRENT_TIMESTAMP")
    )

    updated_at: Mapped[datetime] = mapped_column(
        TIMESTAMP,
        server_default=text("CURRENT_TIMESTAMP"),
        onupdate=text("CURRENT_TIMESTAMP")
    )

    # 🎯 New KYC Columns
    kyc_status: Mapped[str] = mapped_column(
        String(20), 
        default="pending",
    ) # options: not_submitted, pending, verified, rejected
    
    kyc_rejection_reason: Mapped[str | None] = mapped_column(String(500))
    
    kyc_verified_at: Mapped[datetime | None] = mapped_column(TIMESTAMP)

    # ✅ Relationships
    role: Mapped["Role"] = relationship("Role", back_populates="users", lazy="joined")

    # ✅ Relationship to Role (THIS MUST BE INSIDE THE CLASS)
    role: Mapped["Role"] = relationship(
        "Role",
        back_populates="users",
        lazy="joined",
    )
