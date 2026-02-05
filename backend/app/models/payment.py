import uuid
from datetime import datetime
from decimal import Decimal
from sqlalchemy import String, Numeric, TIMESTAMP, ForeignKey, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base


class Payment(Base):
    __tablename__ = "payments"

    payment_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    player_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("players.player_id"),
        nullable=False
    )

    tenant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("tenants.tenant_id"),
        nullable=False
    )

    gateway_id: Mapped[int] = mapped_column(
        ForeignKey("payment_gateways.gateway_id"),
        nullable=False
    )

    amount: Mapped[Decimal] = mapped_column(
        Numeric(18, 2),
        nullable=False
    )

    currency_id: Mapped[int] = mapped_column(
        ForeignKey("currencies.currency_id"),
        nullable=False
    )

    payment_status: Mapped[str] = mapped_column(
        String(20),
        default="pending"
    )

    gateway_reference: Mapped[str] = mapped_column(
        String(255),
        nullable=True
    )

    initiated_at: Mapped[datetime] = mapped_column(
        TIMESTAMP,
        default=datetime.utcnow
    )

    completed_at: Mapped[datetime] = mapped_column(
        TIMESTAMP,
        nullable=True
    )

    __table_args__ = (
        CheckConstraint(
            "payment_status IN ('pending', 'successful', 'failed', 'refunded')",
            name="payment_status_check"
        ),
    )

    # 🔗 Relationships
    player = relationship("Player")
    tenant = relationship("Tenant")
    gateway = relationship("PaymentGateway", back_populates="payments")
    currency = relationship("Currency")
