import uuid
from sqlalchemy import String, TIMESTAMP, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import Base

class GameSession(Base):
    __tablename__ = "game_sessions"

    session_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )

    player_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("players.player_id"), nullable=False
    )

    game_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("games.game_id"), nullable=False
    )

    tenant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("tenants.tenant_id"), nullable=False
    )

    started_at: Mapped[str] = mapped_column(TIMESTAMP)
    ended_at: Mapped[str | None] = mapped_column(TIMESTAMP)

    status: Mapped[str] = mapped_column(String(20), default="active")

    ip_address: Mapped[str | None] = mapped_column(String(45))
    device_info: Mapped[str | None] = mapped_column(String)
