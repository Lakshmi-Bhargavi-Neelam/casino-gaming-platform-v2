from sqlalchemy.orm import Session
from fastapi import HTTPException, status
import re # Added for regex validation
from uuid import UUID
from app.models.user import User
from app.models.player import Player
from app.models.wallet import Wallet
from app.models.country import Country
from app.models.role import Role
from app.models.tenant import Tenant
from app.models.tenant_country import TenantCountry
from app.core.security import get_password_hash

# List of allowed public email providers for strict constraints
ALLOWED_EMAIL_DOMAINS = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "icloud.com"]

class PlayerService:

    @staticmethod
    def validate_email_domain(email: str):
        """Strictly validates that the email belongs to a recognized provider."""
        domain = email.split("@")[-1].lower()
        if domain not in ALLOWED_EMAIL_DOMAINS:
            raise HTTPException(
                status_code=400,
                detail=f"Registration restricted to following email providers: {', '.join(ALLOWED_EMAIL_DOMAINS)}"
            )

    @staticmethod
    def register_player(db: Session, payload):
        PlayerService.validate_email_domain(payload.email)

        # 1. Validate country
        country = db.query(Country).filter(Country.country_code == payload.country_code).first()
        if not country:
            raise HTTPException(400, "Invalid country code")

        # 2. Check Global Email Uniqueness
        existing_user = db.query(User).filter(User.email == payload.email).first()        
        if existing_user:
            raise HTTPException(status_code=409, detail="Account already exists with this email")

        role = db.query(Role).filter(Role.role_name == "PLAYER").first()

        try:
            # 3. Create Global User
            user = User(
                email=payload.email,
                first_name=payload.username, # Using username as display name
                password_hash=get_password_hash(payload.password),
                role_id=role.role_id,
                tenant_id=None, # 🎯 Players don't belong to a tenant at registration
                country_code=payload.country_code,
                status="active",
            )
            db.add(user)
            db.flush() 

            # 4. Create Global Player Profile (No Wallets here!)
            db.add(Player(player_id=user.user_id, status="active", kyc_status="pending"))
            
            db.commit()
            db.refresh(user)
            return {
                "player_id": user.user_id,    # Map user_id to player_id
                "country_code": user.country_code,
                "email": user.email,
                "status": user.status,
                "created_at": user.created_at
            }
        except Exception:
            db.rollback()
            raise
    
    @staticmethod
    def update_self_exclusion(db: Session, user_id: UUID, status: bool):
        user = db.query(User).filter(User.user_id == user_id).first()
        # 'blocked' status effectively stops all logins/entries
        user.status = 'self_excluded' if status else 'active'
        db.commit()