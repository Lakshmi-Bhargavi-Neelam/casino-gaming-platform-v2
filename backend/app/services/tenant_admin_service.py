from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.user import User
from app.models.tenant import Tenant
from app.models.role import Role
from app.core.security import get_password_hash


class TenantAdminService:

    @staticmethod
    def create_tenant_admin(db: Session, payload):
        tenant = db.query(Tenant).filter(
            Tenant.tenant_id == payload.tenant_id
        ).first()

        if not tenant:
            raise HTTPException(404, "Tenant not found")

        # Enforce one admin per tenant
        existing_admin = db.query(User).filter(
            User.tenant_id == tenant.tenant_id,
            User.role.has(role_name="TENANT_ADMIN")
        ).first()

        if existing_admin:
            raise HTTPException(
                status.HTTP_409_CONFLICT,
                "Tenant admin already exists"
            )

        email = f"{payload.admin_username}@{tenant.domain}"

        role = db.query(Role).filter(
            Role.role_name == "TENANT_ADMIN"
        ).first()

        user = User(
            first_name=payload.first_name,
            last_name=payload.last_name,
            email=email,
            password_hash=get_password_hash(payload.password),
            role_id=role.role_id,
            tenant_id=tenant.tenant_id,
            status="active"
        )

        db.add(user)
        db.commit()
        db.refresh(user)

        return {
            "tenant_admin_id": user.user_id,
            "email": email
        }
