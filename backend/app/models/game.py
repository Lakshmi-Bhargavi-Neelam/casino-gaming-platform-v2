import uuid
import enum
from datetime import datetime

from sqlalchemy import String, Numeric, TIMESTAMP, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import Enum as PgEnum
from sqlalchemy.orm import relationship


from app.models.base import Base


class GameStatusEnum(str, enum.Enum):
    PENDING = "pending"
    ACTIVE = "active"
    INACTIVE = "inactive"


class Game(Base):
    __tablename__ = "games"

    game_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    # 🔥 FIXED — UUID not INT
    provider_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("game_providers.provider_id"),
        nullable=False
    )

    category_id: Mapped[int] = mapped_column(
        ForeignKey("game_categories.category_id"),
        nullable=False
    )

    game_name: Mapped[str] = mapped_column(String(150), nullable=False)
    game_code: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)

    rtp_percentage: Mapped[float | None] = mapped_column(Numeric(5, 2))
    volatility: Mapped[str | None] = mapped_column(String(20))

    min_bet: Mapped[float | None] = mapped_column(Numeric(12, 2))
    max_bet: Mapped[float | None] = mapped_column(Numeric(12, 2))

    status: Mapped[GameStatusEnum] = mapped_column(
        PgEnum(
            GameStatusEnum,
            name="game_status_enum",
            values_callable=lambda enum_cls: [e.value for e in enum_cls],
        ),
        default=GameStatusEnum.PENDING,
        nullable=False,
    )

    # 🎮 Game Engine
    engine_type: Mapped[str] = mapped_column(String(50), nullable=False)
    engine_config: Mapped[dict] = mapped_column(JSONB, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP,
        default=datetime.utcnow
    )

    updated_at: Mapped[datetime] = mapped_column(
        TIMESTAMP,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    provider = relationship("GameProvider", back_populates="games")
    tenant_links = relationship("TenantGame", back_populates="game")


