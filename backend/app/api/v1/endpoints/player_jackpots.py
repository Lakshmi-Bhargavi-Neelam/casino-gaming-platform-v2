from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.security import get_current_player
from app.services.jackpot_service import JackpotService
from app.schemas.jackpot import JackpotContribution
from app.core.database import get_db
from uuid import UUID
import uuid
from app.models.jackpot import Jackpot


router = APIRouter(prefix="/player/jackpots", tags=["Player Jackpots"])

@router.get("/active")
def get_active_jackpots(user=Depends(get_current_player), db=Depends(get_db)):
    return db.query(Jackpot).filter(
        Jackpot.tenant_id == user.tenant_id,
        Jackpot.status == "ACTIVE"
    ).all()

@router.post("/{jackpot_id}/contribute")
def contribute(jackpot_id: uuid.UUID, payload: JackpotContribution, user=Depends(get_current_player), db=Depends(get_db)):
    return JackpotService.contribute_to_sponsored(db, user.user_id, jackpot_id, payload.amount)