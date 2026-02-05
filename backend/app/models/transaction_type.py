from sqlalchemy import Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base

class TransactionType(Base):
    __tablename__ = "transaction_types"

    transaction_type_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    transaction_code: Mapped[str] = mapped_column(String(30), unique=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text)

    direction: Mapped[str] = mapped_column(String(10))  # debit / credit
