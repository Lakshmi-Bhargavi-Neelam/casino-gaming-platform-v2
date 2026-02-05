from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base

class Currency(Base):
    __tablename__ = "currencies"

    currency_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    currency_code: Mapped[str] = mapped_column(String(3), unique=True, nullable=False)
    currency_name: Mapped[str] = mapped_column(String(50), nullable=False)
    symbol: Mapped[str | None] = mapped_column(String(5))
    decimal_places: Mapped[int] = mapped_column(default=2)

    deposits = relationship("Deposit", back_populates="currency")

