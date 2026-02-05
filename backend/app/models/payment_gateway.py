from datetime import datetime
from sqlalchemy import String, Boolean, TIMESTAMP, CheckConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base


class PaymentGateway(Base):
    __tablename__ = "payment_gateways"

    gateway_id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)

    gateway_name: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        nullable=False
    )

    gateway_type: Mapped[str] = mapped_column(String(30))

    provider: Mapped[str] = mapped_column(String(100), nullable=True)

    is_active: Mapped[bool] = mapped_column(default=True)

    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP,
        default=datetime.utcnow
    )

    __table_args__ = (
        CheckConstraint(
            "gateway_type IN ('CARD', 'UPI', 'BANK_TRANSFER', 'WALLET', 'CRYPTO')",
            name="gateway_type_check"
        ),
    )

    # 🔗 Relationships
    payments = relationship("Payment", back_populates="gateway")
    deposits = relationship("Deposit", back_populates="gateway")
    withdrawals = relationship("Withdrawal", back_populates="gateway")
