from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import and_, not_
from datetime import datetime
from uuid import UUID

from app.core.database import get_db
from app.core.security import get_current_user 

from app.models.bonus_usage import BonusUsage
from app.models.bonus import Bonus

from app.schemas.bonus_usage import BonusUsageResponse

from app.services.bonus_service import BonusService

router = APIRouter(
    prefix="/player/bonuses",
    tags=["Player Bonuses"]
)

@router.get("/available")
def list_available_promotions(
    tenant_id: UUID, 
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    now = datetime.now() 
    
    claimed_bonus_ids = db.query(BonusUsage.bonus_id).filter(
        BonusUsage.player_id == user.user_id
    ).subquery()

    available = db.query(Bonus).filter(
        Bonus.tenant_id == tenant_id, 
        Bonus.is_active == True,           
        Bonus.valid_from <= now,           
        Bonus.valid_to >= now,              
        not_(Bonus.bonus_id.in_(claimed_bonus_ids))
    ).all()

    return available

@router.get("/my-active")
def list_player_bonuses(
    tenant_id: UUID, 
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    now = datetime.now()

    try:
        results = db.query(BonusUsage).join(
            Bonus, BonusUsage.bonus_id == Bonus.bonus_id
        ).filter(
            BonusUsage.player_id == user.user_id,
            BonusUsage.status.in_(["active", "eligible"]),
            Bonus.tenant_id == tenant_id, 
            Bonus.valid_to > now 
        ).order_by(BonusUsage.granted_at.desc()).all() 

        bonus_list = []
        for usage in results:
            bonus_list.append({
                "bonus_usage_id": str(usage.bonus_usage_id),
                "bonus_amount": float(usage.bonus_amount),
                "wagering_required": float(usage.wagering_required),
                "wagering_completed": float(usage.wagering_completed),
                "status": usage.status,
                "granted_at": usage.granted_at, 
                "bonus_name": usage.bonus.bonus_name, 
                "bonus_type": usage.bonus.bonus_type,
            })
            
        return bonus_list

    except Exception as e:
        print(f"DATABASE ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Ledger Error")

@router.post("/available/{bonus_id}/claim")
def claim_fixed_bonus(
    bonus_id: UUID,
    tenant_id: UUID,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    bonus = db.query(Bonus).filter(
        Bonus.bonus_id == bonus_id,
        Bonus.tenant_id == tenant_id 
    ).first()

    if not bonus or bonus.bonus_type != "FIXED_CREDIT":
        raise HTTPException(400, "Bonus not available for manual claim")

    return BonusService.grant_bonus(db, bonus, user.user_id)

@router.post("/{bonus_usage_id}/convert")
def convert_bonus(
    bonus_usage_id: UUID,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    usage = db.query(BonusUsage).filter(
        BonusUsage.bonus_usage_id == bonus_usage_id,
        BonusUsage.player_id == user.user_id
    ).first()

    if not usage:
        raise HTTPException(404, "Bonus not found or unauthorized")

    return BonusService.convert_bonus_to_cash(
        db=db,
        bonus_usage=usage,
        player_id=user.user_id
    )