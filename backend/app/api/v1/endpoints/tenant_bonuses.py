from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime

from app.core.database import get_db
from app.core.security import require_tenant_admin

from app.models.bonus import Bonus
from app.schemas.bonus import BonusCreate
from app.services.bonus_service import BonusService

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


@router.get("", summary="List all bonuses for this tenant")
def list_tenant_bonuses(
    db: Session = Depends(get_db),
    user = Depends(require_tenant_admin)
):
    now = datetime.utcnow()
    bonuses = db.query(Bonus).filter(Bonus.tenant_id == user.tenant_id).all()
    
    result = []
    for b in bonuses:
        status = "LIVE"
        if not b.is_active:
            status = "PAUSED"
        elif b.valid_to < now:
            status = "EXPIRED"
        elif b.valid_from > now:
            status = "SCHEDULED"
            
        result.append({
            "bonus_id": b.bonus_id,
            "bonus_name": b.bonus_name,
            "bonus_type": b.bonus_type,
            "bonus_amount": float(b.bonus_amount) if b.bonus_amount else 0,
            "bonus_percentage": float(b.bonus_percentage) if b.bonus_percentage else 0,
            "wagering_multiplier": b.wagering_multiplier,
            "valid_to": b.valid_to,
            "is_active": b.is_active,
            "computed_status": status
        })
    return result