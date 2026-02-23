from fastapi import APIRouter, Depends, HTTPException 
from sqlalchemy.orm import Session
import uuid

from app.core.database import get_db
from app.core.security import get_current_player

from app.models.wallet import Wallet
from app.models.game import Game
from app.models.tenant_game import TenantGame

router = APIRouter(tags=["Player Lobby"])

@router.get("/player/lobby-games")
def get_lobby_games(
    tenant_id: uuid.UUID, 
    db: Session = Depends(get_db),
    user = Depends(get_current_player)
):

    wallet_exists = db.query(Wallet).filter(
        Wallet.player_id == user.user_id,
        Wallet.tenant_id == tenant_id
    ).first()
    
    if not wallet_exists:
        raise HTTPException(
            status_code=403, 
            detail="Casino profile not initialized. Please enter via the Marketplace."
        )

    games = db.query(Game).join(TenantGame, Game.game_id == TenantGame.game_id).filter(
        TenantGame.tenant_id == tenant_id,
        TenantGame.is_active == True,
        Game.status == "active"
    ).all()
    
    return games