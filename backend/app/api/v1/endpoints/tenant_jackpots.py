from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.security import require_tenant_admin
from app.services.jackpot_service import JackpotService
from app.schemas.jackpot import JackpotCreate
from app.core.database import get_db
from uuid import UUID
from app.models.jackpot import Jackpot


router = APIRouter(prefix="/tenant/jackpots", tags=["Tenant Jackpots"])

@router.post("")
def create_jackpot(payload: JackpotCreate, user=Depends(require_tenant_admin), db=Depends(get_db)):
    return JackpotService.create_jackpot(db, user.tenant_id, payload)

@router.get("")
def list_my_jackpots(user=Depends(require_tenant_admin), db=Depends(get_db)):
    return db.query(Jackpot).filter(Jackpot.tenant_id == user.tenant_id).all()