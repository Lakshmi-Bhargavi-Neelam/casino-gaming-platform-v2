# app/api/v1/endpoints/responsible_gaming.py
"""
Responsible Gaming API Endpoints

Player-facing endpoints for managing responsible gaming limits:
- Daily deposit limits
- Daily loss limits
- Session limits (max 3 hours)
- Daily wagering limits
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from uuid import UUID
from typing import Optional

from app.core.database import get_db
from app.core.security import get_current_user, get_current_player
from app.models.user import User
from app.services.responsible_gaming_service import ResponsibleGamingService
from app.schemas.player_limit import (
    PlayerLimitCreate,
    PlayerLimitUpdate,
    PlayerLimitResponse,
    LimitCheckRequest,
    LimitCheckResponse
)


router = APIRouter(
    prefix="/player/limits",
    tags=["Responsible Gaming"]
)


# -----------------------------
# GET: List All Limits
# -----------------------------
@router.get("/", response_model=list[PlayerLimitResponse])
def get_my_limits(
    tenant_id: UUID = Query(..., description="The casino/tenant ID"),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_player)
):
    """
    Get all responsible gaming limits for the current player.

    Returns active limits and any pending increases.
    """
    return ResponsibleGamingService.get_player_limits(
        db=db,
        player_id=user.user_id,
        tenant_id=tenant_id
    )


# -----------------------------
# GET: Limit Summary
# -----------------------------
@router.get("/summary")
def get_limit_summary(
    tenant_id: UUID = Query(..., description="The casino/tenant ID"),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_player)
):
    """
    Get a summary of all limits with usage stats.

    Includes active limits and pending changes.
    """
    return ResponsibleGamingService.get_limit_summary(
        db=db,
        player_id=user.user_id,
        tenant_id=tenant_id
    )


# -----------------------------
# POST: Set New Limit
# -----------------------------
@router.post("/", response_model=PlayerLimitResponse)
def set_limit(
    tenant_id: UUID = Query(..., description="The casino/tenant ID"),
    payload: PlayerLimitCreate = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_player)
):
    """
    Set a responsible gaming limit.

    Limit Types:
    - DEPOSIT: Maximum amount to deposit per period
    - LOSS: Maximum amount to lose per period
    - SESSION: Maximum session duration in minutes (max 180 = 3 hours)
    - WAGER: Maximum amount to bet per period

    Periods: DAILY, WEEKLY, MONTHLY

    Rules:
    - Reductions apply immediately
    - Increases require 24-hour cooling period
    """
    return ResponsibleGamingService.set_limit(
        db=db,
        player_id=user.user_id,
        tenant_id=tenant_id,
        payload=payload
    )


# -----------------------------
# GET: Specific Limit Type
# -----------------------------
@router.get("/{limit_type}", response_model=Optional[PlayerLimitResponse])
def get_limit_by_type(
    limit_type: str,
    tenant_id: UUID = Query(..., description="The casino/tenant ID"),
    period: str = Query("DAILY", description="Limit period (DAILY, WEEKLY, MONTHLY)"),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_player)
):
    """
    Get the active limit for a specific type.

    Limit Types: DEPOSIT, LOSS, SESSION, WAGER
    """
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


# -----------------------------
# POST: Check Limit
# -----------------------------
@router.post("/check", response_model=LimitCheckResponse)
def check_limit(
    tenant_id: UUID = Query(..., description="The casino/tenant ID"),
    payload: LimitCheckRequest = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_player)
):
    """
    Check if an action would exceed the player's limit.

    Used before deposits, gameplay, etc. to warn players.
    """
    return ResponsibleGamingService.check_limit(
        db=db,
        player_id=user.user_id,
        tenant_id=tenant_id,
        limit_type=payload.limit_type,
        amount=payload.amount,
        period="DAILY"  # Default to daily
    )


# -----------------------------
# DELETE: Cancel Pending Increase
# -----------------------------
@router.delete("/{limit_id}/pending")
def cancel_pending_limit(
    limit_id: UUID,
    tenant_id: UUID = Query(..., description="The casino/tenant ID"),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_player)
):
    """
    Cancel a pending limit increase.

    Only pending increases can be cancelled.
    Active limits cannot be removed (regulatory requirement).
    """
    return ResponsibleGamingService.cancel_pending_increase(
        db=db,
        player_id=user.user_id,
        tenant_id=tenant_id,
        limit_id=limit_id
    )


# -----------------------------
# DELETE: Remove Limit (with restrictions)
# -----------------------------
@router.delete("/{limit_id}")
def remove_limit(
    limit_id: UUID,
    tenant_id: UUID = Query(..., description="The casino/tenant ID"),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_player)
):
    """
    Remove a responsible gaming limit.

    Note: Active limits cannot be removed immediately due to regulatory requirements.
    Only pending increases can be cancelled.
    """
    return ResponsibleGamingService.remove_limit(
        db=db,
        player_id=user.user_id,
        tenant_id=tenant_id,
        limit_id=limit_id
    )
