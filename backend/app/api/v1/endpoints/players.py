from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.schemas.player import PlayerCreate, PlayerRegisterResponse
from app.services.player_service import PlayerService
from app.core.database import get_db

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
