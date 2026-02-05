from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid

from app.schemas.game import GameCreate
# Assuming you have a GameResponse schema, if not, I'll provide a basic one below
from app.models.game import Game, GameStatusEnum
from app.services.game_service import GameService
from app.models.game_provider import GameProvider

from app.core.database import get_db
from app.core.security import require_super_admin, get_current_user
from app.models.user import User

router = APIRouter(tags=["Games"])

@router.post("", status_code=status.HTTP_201_CREATED)
def submit_game(
    payload: GameCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1️⃣ Must be provider role
    if current_user.role.role_name != "GAME_PROVIDER":
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Only Providers can submit games")

    # 2️⃣ Check provider profile exists
    provider = db.query(GameProvider).filter(
        GameProvider.provider_id == current_user.user_id,
        GameProvider.is_active.is_(True)
    ).first()

    if not provider:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "User is not registered as a provider")

    # 3️⃣ Use user_id as provider_id
    return GameService.submit_game(db, payload, current_user.user_id)


# --- 2. SUPER ADMIN: Get Pending Games ---
@router.get("/pending")
def get_pending_games(
    db: Session = Depends(get_db),
    _: User = Depends(require_super_admin)
):
    return db.query(Game).filter(Game.status == GameStatusEnum.PENDING).all()


# --- 3. SUPER ADMIN: Approve Game ---
@router.patch("/{game_id}/approve")
def approve_game(
    game_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: User = Depends(require_super_admin)
):
    return GameService.approve_game(db, game_id)

# --- 4. SUPER ADMIN: Reject / Deactivate Game ---
@router.patch("/{game_id}/deactivate")
def deactivate_game(
    game_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: User = Depends(require_super_admin)
):
    return GameService.deactivate_game(db, game_id)



