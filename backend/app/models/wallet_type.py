from sqlalchemy import Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base

class WalletType(Base):
    __tablename__ = "wallet_types"

    wallet_type_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    wallet_type_code: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text)

    wallets = relationship("Wallet", back_populates="wallet_type")
