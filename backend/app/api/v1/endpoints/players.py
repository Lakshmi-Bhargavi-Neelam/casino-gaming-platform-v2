from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.security import get_current_user
from app.schemas.player import PlayerCreate, PlayerRegisterResponse
from app.services.player_service import PlayerService
from app.core.database import get_db
from app.schemas.player import SelfExclusionRequest

router = APIRouter(
        tags=["Players"]
)


@router.post(
    "/register",
    response_model=PlayerRegisterResponse,
    status_code=201,
)
def register_player(
    payload: PlayerCreate,
    db: Session = Depends(get_db),
):
    return PlayerService.register_player(db, payload)


@router.post("/self-exclusion")
def update_self_exclusion(
    payload: SelfExclusionRequest,
    db: Session = Depends(get_db),
    user = Depends(get_current_user) # Get the logged-in player
):
    # This calls the static method you showed me
    PlayerService.update_self_exclusion(db, user.user_id, payload.status)
    
    return {"message": "Security status updated successfully"}