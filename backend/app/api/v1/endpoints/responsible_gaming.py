from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from uuid import UUID
from typing import Optional

from app.core.database import get_db
from app.core.security import get_current_user, get_current_player

from app.models.user import User

from app.schemas.player_limit import (
    PlayerLimitCreate,
    PlayerLimitUpdate,
    PlayerLimitResponse,
    LimitCheckRequest,
    LimitCheckResponse
)

from app.services.responsible_gaming_service import ResponsibleGamingService



router = APIRouter(
    prefix="/player/limits",
    tags=["Responsible Gaming"]
)

# GET: List All Limits
@router.get("/", response_model=list[PlayerLimitResponse])
def get_my_limits(
    tenant_id: UUID = Query(..., description="The casino/tenant ID"),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_player)
):

    return ResponsibleGamingService.get_player_limits(
        db=db,
        player_id=user.user_id,
        tenant_id=tenant_id
    )

@router.get("/summary")
def get_limit_summary(
    tenant_id: UUID = Query(..., description="The casino/tenant ID"),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_player)
):

    return ResponsibleGamingService.get_limit_summary(
        db=db,
        player_id=user.user_id,
        tenant_id=tenant_id
    )

@router.post("/", response_model=PlayerLimitResponse)
def set_limit(
    tenant_id: UUID = Query(..., description="The casino/tenant ID"),
    payload: PlayerLimitCreate = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_player)
):

    return ResponsibleGamingService.set_limit(
        db=db,
        player_id=user.user_id,
        tenant_id=tenant_id,
        payload=payload
    )

# GET: Specific Limit Type
@router.get("/{limit_type}", response_model=Optional[PlayerLimitResponse])
def get_limit_by_type(
    limit_type: str,
    tenant_id: UUID = Query(..., description="The casino/tenant ID"),
    period: str = Query("DAILY", description="Limit period (DAILY, WEEKLY, MONTHLY)"),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_player)
):

    limit = ResponsibleGamingService.get_limit_by_type(
        db=db,
        player_id=user.user_id,
        tenant_id=tenant_id,
        limit_type=limit_type.upper(),
        period=period.upper()
    )

    if not limit:
        return None

    now = ResponsibleGamingService._get_period_end.__self__._get_period_end.__code__.co_consts[1]  # placeholder
    from datetime import datetime
    now = datetime.now()

    remaining = float(limit.limit_value) - float(limit.current_usage or 0)

    return PlayerLimitResponse(
        limit_id=limit.limit_id,
        player_id=limit.player_id,
        tenant_id=limit.tenant_id,
        limit_type=limit.limit_type,
        limit_value=float(limit.limit_value),
        period=limit.period,
        status=limit.status,
        current_usage=float(limit.current_usage or 0),
        effective_at=limit.effective_at,
        requested_at=limit.requested_at,
        period_start=limit.period_start,
        created_at=limit.created_at,
        updated_at=limit.updated_at,
        remaining=round(max(0, remaining), 2),
        is_pending=False,
        pending_increases_in=None
    )


# POST: Check Limit
@router.post("/check", response_model=LimitCheckResponse)
def check_limit(
    tenant_id: UUID = Query(..., description="The casino/tenant ID"),
    payload: LimitCheckRequest = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_player)
):

    return ResponsibleGamingService.check_limit(
        db=db,
        player_id=user.user_id,
        tenant_id=tenant_id,
        limit_type=payload.limit_type,
        amount=payload.amount,
        period="DAILY"  
    )

@router.delete("/{limit_id}/pending")
def cancel_pending_limit(
    limit_id: UUID,
    tenant_id: UUID = Query(..., description="The casino/tenant ID"),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_player)
):

    return ResponsibleGamingService.cancel_pending_increase(
        db=db,
        player_id=user.user_id,
        tenant_id=tenant_id,
        limit_id=limit_id
    )

@router.delete("/{limit_id}")
def remove_limit(
    limit_id: UUID,
    tenant_id: UUID = Query(..., description="The casino/tenant ID"),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_player)
):

    return ResponsibleGamingService.remove_limit(
        db=db,
        player_id=user.user_id,
        tenant_id=tenant_id,
        limit_id=limit_id
    )
