from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import require_tenant_admin
from app.services.bonus_service import BonusService
from app.schemas.bonus import BonusCreate   # <-- THIS IS MISSING
from app.models.bonus import Bonus


router = APIRouter(
    prefix="/tenant/bonuses",
    tags=["Tenant Bonuses"]
)

@router.post("")
def create_bonus(
    payload: BonusCreate,
    db: Session = Depends(get_db),
    user = Depends(require_tenant_admin)
):
    return BonusService.create_bonus(db, user.tenant_id, payload)

# app/api/v1/endpoints/tenant_bonuses.py (or similar)

@router.get("", summary="List all bonuses for this tenant")
def list_tenant_bonuses(
    db: Session = Depends(get_db),
    user = Depends(require_tenant_admin)
):
    # Fetch all bonuses belonging to the logged-in admin's tenant
    return db.query(Bonus).filter(Bonus.tenant_id == user.tenant_id).all()

