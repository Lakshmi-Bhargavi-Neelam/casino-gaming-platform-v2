from uuid import UUID
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field

from app.core.database import get_db
from app.core.security import get_current_player, require_tenant_admin

from app.models.player import Player

from app.schemas.responsible_limits import ResponsibleLimitResponse, ResponsibleUsageResponse, UpdateLimitsRequest

from app.services.responsible_gaming_service import ResponsibleGamingService


router = APIRouter(
    prefix="/responsible-gaming",
    tags=["Responsible Gaming"]
)

# PLAYER ENDPOINTS

@router.get("/me", response_model=ResponsibleLimitResponse)
def get_my_limits(
    db: Session = Depends(get_db),
    current_user: Player = Depends(get_current_player)
):
    limits = ResponsibleGamingService.get_limits(
        db,
        current_user.player_id,
        current_user.tenant_id
    )

    if not limits:
        raise HTTPException(status_code=404, detail="No limits configured")

    return limits


@router.get("/me/usage", response_model=ResponsibleUsageResponse)
def get_my_usage(
    db: Session = Depends(get_db),
    current_user: Player = Depends(get_current_player)
):
    usage = ResponsibleGamingService.get_today_usage(
        db,
        current_user.player_id,
        current_user.tenant_id
    )

    if not usage:
        raise HTTPException(status_code=404, detail="No usage data")

    return usage


@router.post("/me", response_model=ResponsibleLimitResponse)
def update_my_limits(
    payload: UpdateLimitsRequest,
    db: Session = Depends(get_db),
    current_user: Player = Depends(get_current_player)
):
    updated = ResponsibleGamingService.update_player_limits(
        db,
        current_user.player_id,
        current_user.tenant_id,
        payload
    )

    return updated


# ADMIN ENDPOINTS

admin_router = APIRouter(
    prefix="/admin/responsible-gaming",
    tags=["Admin Responsible Gaming"]
)


@admin_router.get("/player/{player_id}", response_model=ResponsibleLimitResponse)
def get_player_limits(
    player_id: UUID,
    db: Session = Depends(get_db),
    admin=Depends(require_tenant_admin)
):
    limits = ResponsibleGamingService.get_limits(
        db,
        player_id,
        admin.tenant_id
    )

    if not limits:
        raise HTTPException(status_code=404, detail="No limits configured")

    return limits


@admin_router.post("/player/{player_id}", response_model=ResponsibleLimitResponse)
def set_player_limits(
    player_id: UUID,
    payload: UpdateLimitsRequest,
    db: Session = Depends(get_db),
    admin=Depends(require_tenant_admin)
):
    updated = ResponsibleGamingService.admin_set_limits(
        db,
        player_id,
        admin.tenant_id,
        payload
    )

    return updated


@admin_router.get("/player/{player_id}/usage", response_model=ResponsibleUsageResponse)
def get_player_usage(
    player_id: UUID,
    db: Session = Depends(get_db),
    admin=Depends(require_tenant_admin)
):
    usage = ResponsibleGamingService.get_today_usage(
        db,
        player_id,
        admin.tenant_id
    )

    if not usage:
        raise HTTPException(status_code=404, detail="No usage data")

    return usage
