from sqlalchemy import String, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base

class Country(Base):
    __tablename__ = "countries"

    country_code: Mapped[str] = mapped_column(String(2), primary_key=True)
    country_name: Mapped[str] = mapped_column(String(100), nullable=False)
    default_timezone: Mapped[str] = mapped_column(String(50), nullable=False)
    default_currency_id: Mapped[int] = mapped_column(
        ForeignKey("currencies.currency_id"), nullable=False
    )
