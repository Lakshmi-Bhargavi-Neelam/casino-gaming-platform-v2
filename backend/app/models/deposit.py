import uuid
from datetime import datetime
from sqlalchemy import String, Numeric, TIMESTAMP, ForeignKey, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base


class Deposit(Base):
    __tablename__ = "deposits"

    deposit_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    player_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("players.player_id")
    )

    tenant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("tenants.tenant_id")
    )

    wallet_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("wallets.wallet_id")
    )

    amount: Mapped[float] = mapped_column(Numeric(18, 2))

    currency_id: Mapped[int] = mapped_column(
        ForeignKey("currencies.currency_id")
    )

    status: Mapped[str] = mapped_column(
        String(20),
        default="pending"
    )

    gateway_id: Mapped[int] = mapped_column(
        ForeignKey("payment_gateways.gateway_id"),
        nullable=True
    )

    gateway_reference: Mapped[str] = mapped_column(
        String(255),
        nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP,
        default=datetime.utcnow
    )

    completed_at: Mapped[datetime] = mapped_column(
        TIMESTAMP,
        nullable=True
    )

    __table_args__ = (
        CheckConstraint(
            "status IN ('pending','success','failed')",
            name="deposit_status_check"
        ),
    )

    player = relationship("Player", back_populates="deposits")
    tenant = relationship("Tenant", back_populates="deposits")
    wallet = relationship("Wallet", back_populates="deposits")
    currency = relationship("Currency", back_populates="deposits")
    gateway = relationship("PaymentGateway", back_populates="deposits")
