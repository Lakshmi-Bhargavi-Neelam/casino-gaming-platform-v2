from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import and_, not_
from datetime import datetime
from uuid import UUID

from app.core.database import get_db
from app.core.security import get_current_user 
from app.models.bonus_usage import BonusUsage
from app.models.bonus import Bonus
from app.services.bonus_service import BonusService

# Fetch active instances for the player's progress
# app/api/v1/endpoints/player_bonuses.py

from app.schemas.bonus_usage import BonusUsageResponse

router = APIRouter(
    prefix="/player/bonuses",
    tags=["Player Bonuses"]
)

# 🎯 THE "IMMEDIATE" LOGIC: Fetch available templates
@router.get("/available")
def list_available_promotions(
    tenant_id: UUID, # 🎯 Add this as a query param
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    now = datetime.now() 
    
    # 1. Identify IDs of bonuses this player has already claimed/triggered
    claimed_bonus_ids = db.query(BonusUsage.bonus_id).filter(
        BonusUsage.player_id == user.user_id
    ).subquery()

    # 2. Query the 'bonuses' table directly for immediate visibility
    available = db.query(Bonus).filter(
        Bonus.tenant_id == tenant_id, # 👈 ISOLATION
        Bonus.is_active == True,            # Rule 2: Must be enabled by Admin
        Bonus.valid_from <= now,            # Rule 3: Time check (Start)
        Bonus.valid_to >= now,              # Rule 3: Time check (End)
        not_(Bonus.bonus_id.in_(claimed_bonus_ids)) # Don't show if already claimed
    ).all()

    return available


# app/api/v1/endpoints/player_bonuses.py

@router.get("/my-active")
def list_player_bonuses(
    tenant_id: UUID, # 🎯 Add this as a query param
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    now = datetime.now() # 🎯 FIX: Use .now() here too

    try:
        # Join BonusUsage with Bonus template
        results = db.query(BonusUsage).join(
            Bonus, BonusUsage.bonus_id == Bonus.bonus_id
        ).filter(
            BonusUsage.player_id == user.user_id,
            BonusUsage.status.in_(["active", "eligible"]),
            Bonus.tenant_id == tenant_id, # 👈 ISOLATION
            Bonus.valid_to > now 
        ).order_by(BonusUsage.granted_at.desc()).all() # 🎯 Use granted_at

        bonus_list = []
        for usage in results:
            bonus_list.append({
                "bonus_usage_id": str(usage.bonus_usage_id),
                "bonus_amount": float(usage.bonus_amount),
                "wagering_required": float(usage.wagering_required),
                "wagering_completed": float(usage.wagering_completed),
                "status": usage.status,
                "granted_at": usage.granted_at, # 🎯 Use granted_at
                # Now usage.bonus will work because of the relationship fix!
                "bonus_name": usage.bonus.bonus_name, 
                "bonus_type": usage.bonus.bonus_type,
            })
            
        return bonus_list

    except Exception as e:
        print(f"DATABASE ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Ledger Error")


# Manually claim a fixed credit bonus
@router.post("/available/{bonus_id}/claim")
def claim_fixed_bonus(
    bonus_id: UUID,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    bonus = db.query(Bonus).filter(
        Bonus.bonus_id == bonus_id,
        Bonus.tenant_id == user.tenant_id
    ).first()

    if not bonus or bonus.bonus_type != "FIXED_CREDIT":
        raise HTTPException(400, "Bonus not available for manual claim")

    return BonusService.grant_bonus(db, bonus, user.user_id)

# Convert logic remains the same...

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