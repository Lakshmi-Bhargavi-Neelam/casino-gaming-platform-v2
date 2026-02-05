from sqlalchemy import Integer, Numeric, TIMESTAMP, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base

class BetTax(Base):
    __tablename__ = "bet_taxes"

    bet_tax_id: Mapped[int] = mapped_column(Integer, primary_key=True)

    bet_id: Mapped[str] = mapped_column(
        ForeignKey("bets.bet_id"), nullable=False
    )

    tax_rule_id: Mapped[int | None] = mapped_column(
        ForeignKey("tax_rules.tax_rule_id")
    )

    tax_amount: Mapped[float] = mapped_column(Numeric(18, 2), nullable=False)
    created_at: Mapped[str] = mapped_column(TIMESTAMP)
