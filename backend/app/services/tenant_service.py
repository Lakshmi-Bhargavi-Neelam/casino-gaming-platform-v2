from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status

from app.models.tenant import Tenant
from app.models.country import Country
from app.models.tenant_country import TenantCountry
from app.schemas.tenant import TenantCreate


class TenantService:

    @staticmethod
    def get_tenants_by_country(db: Session, country_code: str):
        return (
            db.query(Tenant)
            .join(TenantCountry, Tenant.tenant_id == TenantCountry.tenant_id)
            .filter(
                TenantCountry.country_code == country_code,
                TenantCountry.is_active.is_(True),
                Tenant.status == "active",
            )
            .all()
        )

    @staticmethod
    def create_tenant(
        db: Session,
        payload: TenantCreate
    ) -> Tenant:

        # 1️⃣ Validate countries
        countries = (
            db.query(Country)
            .filter(Country.country_code.in_(payload.allowed_countries))
            .all()
        )

        if len(countries) != len(payload.allowed_countries):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="One or more country codes are invalid"
            )

        # 2️⃣ Create tenant
        tenant = Tenant(
            tenant_name=payload.tenant_name,
            domain=payload.domain,
            status="active"
        )

        db.add(tenant)
        db.flush()  # get tenant_id

        # 3️⃣ Insert tenant_countries
        tenant_country_rows = [
            TenantCountry(
                tenant_id=tenant.tenant_id,
                country_code=country.country_code,
                is_active=True
            )
            for country in countries
        ]

        db.bulk_save_objects(tenant_country_rows)

        try:
            db.commit()
        except IntegrityError:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Tenant with same name or domain already exists"
            )

        db.refresh(tenant)
        return tenant
