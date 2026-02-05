from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.user import User
from app.models.player import Player
from app.models.wallet import Wallet
from app.models.country import Country
from app.models.role import Role
from app.models.tenant import Tenant
from app.models.tenant_country import TenantCountry
from app.core.security import get_password_hash


class PlayerService:

    @staticmethod
    def register_player(db: Session, payload):
        # 1️⃣ Validate country
        country = db.query(Country).filter(
            Country.country_code == payload.country_code
        ).first()

        if not country:
            raise HTTPException(
                status_code=400,
                detail="Invalid country code"
            )

        # 2️⃣ Validate tenant
        tenant = db.query(Tenant).filter(
            Tenant.tenant_id == payload.tenant_id,
            Tenant.status == "active"
        ).first()

        if not tenant:
            raise HTTPException(
                status_code=400,
                detail="Invalid or inactive tenant"
            )

        # 3️⃣ Validate tenant operates in selected country
        valid_mapping = db.query(TenantCountry).filter(
            TenantCountry.tenant_id == payload.tenant_id,
            TenantCountry.country_code == payload.country_code,
            TenantCountry.is_active.is_(True)
        ).first()

        if not valid_mapping:
            raise HTTPException(
                status_code=400,
                detail="Tenant does not operate in selected country"
            )

        # 4️⃣ Enforce email domain
        email_domain = payload.email.split("@")[-1]

        if email_domain.lower() != tenant.domain.lower():
            raise HTTPException(
                status_code=400,
                detail=f"Email must belong to domain {tenant.domain}"
            )

        # 5️⃣ Prevent duplicate email
        existing_user = db.query(User).filter(
            User.email == payload.email
        ).first()

        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered"
            )

        # 6️⃣ Get PLAYER role
        role = db.query(Role).filter(
            Role.role_name == "PLAYER"
        ).first()

        if not role:
            raise HTTPException(500, "PLAYER role not configured")

        try:
            # 7️⃣ Create user
            user = User(
                email=payload.email,
                password_hash=get_password_hash(payload.password),
                role_id=role.role_id,
                tenant_id=payload.tenant_id,
                country_code=payload.country_code,
                status="active",
            )
            db.add(user)
            db.flush()  # get user_id

            # 8️⃣ Create player
            player = Player(
                player_id=user.user_id,
                status="active",
                kyc_status="pending"
            )
            db.add(player)

            # 9️⃣ Create CASH wallet
            db.add(Wallet(
                player_id=user.user_id,
                tenant_id=payload.tenant_id,
                currency_id=country.default_currency_id,
                wallet_type_id=1,  # CASH
                balance=0,
                is_active=True
            ))

            # 🔟 Create BONUS wallet (currency NULL)
            db.add(Wallet(
                player_id=user.user_id,
                tenant_id=payload.tenant_id,
                currency_id=None,
                wallet_type_id=2,  # BONUS
                balance=0,
                is_active=True
            ))

            db.commit()
            db.refresh(user)

        except Exception:
            db.rollback()
            raise

        return {
            "player_id": user.user_id,
            "tenant_id": payload.tenant_id,
            "country_code": payload.country_code,
            "email": user.email,
            "status": user.status,
            "created_at": user.created_at,
        }
