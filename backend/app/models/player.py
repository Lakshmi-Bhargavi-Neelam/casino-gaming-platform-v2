import uuid
from sqlalchemy import String, TIMESTAMP, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base

class Player(Base):
    __tablename__ = "players"

    player_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.user_id"), primary_key=True
    )

    status: Mapped[str] = mapped_column(String(20), default="active")
    kyc_status: Mapped[str] = mapped_column(String(20), default="pending")
    kyc_verified_at: Mapped[str | None] = mapped_column(TIMESTAMP)
    last_login_at: Mapped[str | None] = mapped_column(TIMESTAMP)

    created_at: Mapped[str] = mapped_column(TIMESTAMP)
    updated_at: Mapped[str] = mapped_column(TIMESTAMP)

    deposits = relationship("Deposit", back_populates="player")
    
