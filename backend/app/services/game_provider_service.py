# app/services/game_provider_service.py

from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.user import User
from app.models.game_provider import GameProvider
from app.models.role import Role
from app.core.security import get_password_hash
from app.services.player_service import PlayerService


class GameProviderService:

    @staticmethod
    def create_provider(db: Session, payload):
        # 1️⃣ Strict Domain Validation
        PlayerService.validate_email_domain(payload.email)

        existing_user = db.query(User).filter(
            User.email == payload.email,
            User.tenant_id == None  # This specifically looks for tenant_id IS NULL
        ).first()        
        if existing_user:
            raise HTTPException(400, "Email already registered")

        role = db.query(Role).filter(Role.role_name == "GAME_PROVIDER").first()
        if not role:
            raise HTTPException(500, "GAME_PROVIDER role not configured")

        user = User(
            email=payload.email,
            password_hash=get_password_hash(payload.password),
            role_id=role.role_id,
            tenant_id=None, # 🎯 Explicitly NULL
            status="active"
        )

        db.add(user)
        db.flush()

        provider = GameProvider(
            provider_id=user.user_id,
            provider_name=payload.provider_name,
            website=payload.website,
            is_active=True
        )

        db.add(provider)
        db.commit()
        db.refresh(provider)
        return provider
