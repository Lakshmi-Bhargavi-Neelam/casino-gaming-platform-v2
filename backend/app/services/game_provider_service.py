# app/services/game_provider_service.py

from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.user import User
from app.models.game_provider import GameProvider
from app.models.role import Role
from app.core.security import get_password_hash


class GameProviderService:

    @staticmethod
    def create_provider(db: Session, payload):

        # 🔎 Check email not already used
        existing_user = db.query(User).filter(User.email == payload.email).first()
        if existing_user:
            raise HTTPException(400, "Email already registered")

        # 🎭 Get GAME_PROVIDER role
        role = db.query(Role).filter(Role.role_name == "GAME_PROVIDER").first()
        if not role:
            raise HTTPException(500, "GAME_PROVIDER role not configured")

        # 👤 Create user account
        user = User(
            email=payload.email,
            password_hash=get_password_hash(payload.password),
            role_id=role.role_id,
            status="active"
        )

        db.add(user)
        db.flush()  # ⬅️ generates user.user_id

        # 🎮 Create provider profile LINKED to user
        provider = GameProvider(
            provider_id=user.user_id,   # 🔥 THIS WAS MISSING
            provider_name=payload.provider_name,
            website=payload.website,
            is_active=True
        )

        db.add(provider)
        db.commit()
        db.refresh(provider)

        return provider
