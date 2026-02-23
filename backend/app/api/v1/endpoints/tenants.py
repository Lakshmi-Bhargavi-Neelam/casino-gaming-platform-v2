from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from uuid import UUID
import uuid
from app.core.database import get_db
from app.schemas.tenant import TenantCreate, TenantResponse, TenantPublic
from app.services.tenant_service import TenantService
from app.core.security import require_super_admin, get_current_user
from app.models import Tenant, TenantCountry
from app.services.wallet_service import WalletService

router = APIRouter(tags=["Tenants"])

# --- NEW: List All Tenants ---
@router.get("", response_model=list[TenantResponse])
def list_all_tenants(
    db: Session = Depends(get_db),
    current_user=Depends(require_super_admin)
):
 
    tenants = db.query(Tenant).all()
    
    return [
        TenantResponse(
            tenant_id=t.tenant_id,
            tenant_name=t.tenant_name,
            domain=t.domain,
            status=t.status,
            allowed_countries=[] 
        ) for t in tenants
    ]

# --- Existing: List by Country ---
@router.get("/by-country/{country_code}",
    response_model=list[TenantPublic],
)
def list_tenants_by_country(
    country_code: str,
    db: Session = Depends(get_db),
):
    return TenantService.get_tenants_by_country(db, country_code)

# --- Existing: Register Tenant ---
@router.post(
    "",
    response_model=TenantResponse,
    status_code=status.HTTP_201_CREATED
)
def register_tenant(
    payload: TenantCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_super_admin)
):
    tenant = TenantService.create_tenant(db, payload)

    allowed_countries = [
        tc.country_code for tc in
        db.query(TenantCountry)
          .filter(TenantCountry.tenant_id == tenant.tenant_id)
          .all()
    ]

    return TenantResponse(
        tenant_id=tenant.tenant_id,
        tenant_name=tenant.tenant_name,
        domain=tenant.domain,
        status=tenant.status,
        allowed_countries=allowed_countries
    )

@router.post("/{tenant_id}/enter")
def enter_casino(
    tenant_id: uuid.UUID, 
    db: Session = Depends(get_db), 
    user = Depends(get_current_user)
):
    return WalletService.init_tenant_profile(db, user.user_id, tenant_id)