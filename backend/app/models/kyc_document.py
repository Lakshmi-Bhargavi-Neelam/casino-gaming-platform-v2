import uuid
from datetime import datetime

from sqlalchemy import String, TIMESTAMP, ForeignKey, Boolean, Integer, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class KYCDocument(Base):
    __tablename__ = "kyc_documents"

    document_id: Mapped[int] = mapped_column(primary_key=True)

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.user_id"),
        nullable=False
    )

    document_type: Mapped[str] = mapped_column(String(50), nullable=False)

    file_path: Mapped[str] = mapped_column(String(500), nullable=False)

    # 🔥 Updated statuses supported by DB constraint
    verification_status: Mapped[str] = mapped_column(
        String(20),
        default="pending"
    )
    # pending | submitted | re-submitted | verified | rejected | expired

    # 🆕 Document attempt versioning
    version: Mapped[int] = mapped_column(Integer, default=1)

    # 🆕 Only latest document stays active
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # Rejection feedback
    rejection_reason: Mapped[str | None] = mapped_column(String(500))

    verified_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.user_id")
    )

    verified_at: Mapped[datetime | None] = mapped_column(TIMESTAMP)

    uploaded_at: Mapped[datetime] = mapped_column(
        TIMESTAMP,
        server_default=text("CURRENT_TIMESTAMP")
    )

    # Optional relationships (if you use them elsewhere)
    user = relationship("User", foreign_keys=[user_id])
    verifier = relationship("User", foreign_keys=[verified_by])
