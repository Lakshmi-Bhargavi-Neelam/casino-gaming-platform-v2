import uuid
from datetime import datetime
from sqlalchemy import String, Boolean, TIMESTAMP, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import Base
from sqlalchemy.orm import relationship


class GameProvider(Base):
    __tablename__ = "game_providers"

    provider_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.user_id", ondelete="CASCADE"),
        primary_key=True
    )

    provider_name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    website: Mapped[str | None] = mapped_column(String(255))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP, default=datetime.utcnow)

    # ✅ MUST BE INDENTED INSIDE CLASS
    games = relationship("Game", back_populates="provider")
