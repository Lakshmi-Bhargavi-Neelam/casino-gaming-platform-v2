from fastapi import APIRouter, Depends, Body
from sqlalchemy.orm import Session
from uuid import UUID

from app.core.database import get_db
from app.core.security import require_tenant_admin
from app.core.kyc_guard import enforce_kyc_verified
from app.services.tenant_game_service import TenantGameService

router = APIRouter(tags=["Tenant Games"])


# 🎯 Marketplace (All ACTIVE platform games + tenant status)
@router.get("/marketplace")
def get_marketplace_games(
    db: Session = Depends(get_db),
    user=Depends(require_tenant_admin)
):
    enforce_kyc_verified(user)
    return TenantGameService.list_available_market_games(db, user.tenant_id)


# 🔘 Enable / Disable Game
@router.post("/toggle")
def toggle_game(
    payload: dict = Body(...),
    db: Session = Depends(get_db),
    user=Depends(require_tenant_admin)
):
    enforce_kyc_verified(user)
    game_id = UUID(payload.get("game_id"))
    is_active = payload.get("is_active")

    if is_active:
        return TenantGameService.enable_game(db, user.tenant_id, game_id)
    else:
        return TenantGameService.disable_game(db, user.tenant_id, game_id)


# 🎛 Update tenant overrides
@router.patch("/{game_id}/override")
def update_overrides(
    game_id: UUID,
    min_bet: float | None = None,
    max_bet: float | None = None,
    rtp_override: float | None = None,
    db: Session = Depends(get_db),
    user=Depends(require_tenant_admin)
):
    enforce_kyc_verified(user)
    return TenantGameService.update_overrides(
        db,
        user.tenant_id,
        game_id,
        min_bet,
        max_bet,
        rtp_override
    )

    # tenant_games.py

@router.get("/enabled")
def get_enabled_games(
    db: Session = Depends(get_db),
    user=Depends(require_tenant_admin)
):
    return TenantGameService.list_enabled_games(db, user.tenant_id)

