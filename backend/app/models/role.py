from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Role(Base):
    __tablename__ = "roles"

    role_id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True
    )

    role_name: Mapped[str] = mapped_column(
        String(30),
        unique=True,
        nullable=False
    )

    # ✅ MUST MATCH User.role exactly
    users: Mapped[list["User"]] = relationship(
        "User",
        back_populates="role",
    )
