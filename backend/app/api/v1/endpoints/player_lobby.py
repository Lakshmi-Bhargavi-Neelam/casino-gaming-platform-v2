from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.services.lobby_service import LobbyService
from app.core.security import get_db, get_current_user

router = APIRouter(tags=["Player Lobby"])
@router.get("/lobby", summary="Get games available for player lobby")

@router.get("/player/lobby-games")
def lobby_games(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return LobbyService.get_lobby_games(db, user.tenant_id)
