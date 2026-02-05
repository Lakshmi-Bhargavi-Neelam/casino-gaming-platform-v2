import uuid
from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import String, Numeric, TIMESTAMP, ForeignKey, CheckConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base


class Withdrawal(Base):
    __tablename__ = "withdrawals"

    withdrawal_id: Mapped[uuid.UUID] = mapped_column(
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

    wallet_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("wallets.wallet_id"),
        nullable=False
    )

    amount: Mapped[float] = mapped_column(Numeric(18, 2), nullable=False)

    currency_id: Mapped[int] = mapped_column(
        ForeignKey("currencies.currency_id"),
        nullable=False
    )

    status: Mapped[str] = mapped_column(
        String(20),
        default="requested"
    )

    requested_at: Mapped[datetime] = mapped_column(
        TIMESTAMP,
        default=datetime.utcnow
    )

    processed_at: Mapped[datetime] = mapped_column(
        TIMESTAMP,
        nullable=True
    )

    gateway_id: Mapped[int] = mapped_column(
        ForeignKey("payment_gateways.gateway_id"),
        nullable=True
    )

    gateway_reference: Mapped[str] = mapped_column(
        String(255),
        nullable=True
    )

    rejection_reason: Mapped[str] = mapped_column(
        String,
        nullable=True
    )

    __table_args__ = (
        CheckConstraint(
            """status IN (
                'requested','kyc_pending','approved','rejected',
                'processing','completed'
            )""",
            name="withdrawal_status_check"
        ),
    )

    # 🔗 Relationships
    player = relationship("Player")
    tenant = relationship("Tenant")
    wallet = relationship("Wallet")
    currency = relationship("Currency")
    gateway = relationship("PaymentGateway")
