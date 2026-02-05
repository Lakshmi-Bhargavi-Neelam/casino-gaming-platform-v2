import uuid
from sqlalchemy import Numeric, Boolean, TIMESTAMP, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base

class Wallet(Base):
    __tablename__ = "wallets"

    wallet_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )

    player_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("players.player_id"))
    tenant_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("tenants.tenant_id"))
    currency_id: Mapped[int] = mapped_column(ForeignKey("currencies.currency_id"))
    wallet_type_id: Mapped[int] = mapped_column(ForeignKey("wallet_types.wallet_type_id"))

    balance: Mapped[float] = mapped_column(Numeric(18, 2), default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    created_at: Mapped[str] = mapped_column(TIMESTAMP)
    updated_at: Mapped[str] = mapped_column(TIMESTAMP)

    deposits = relationship("Deposit", back_populates="wallet")
    wallet_type = relationship("WalletType", back_populates="wallets")

