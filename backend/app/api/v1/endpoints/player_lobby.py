from fastapi import APIRouter, Depends, HTTPException # 🎯 Added HTTPException
from sqlalchemy.orm import Session
import uuid

from app.core.database import get_db
from app.core.security import get_current_player
# 🎯 Added Missing Model Imports
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
    # 1. Security Check: Ensure the player has "entered" this casino (wallets exist)
    # This ensures global users can't see game lists of casinos they haven't joined.
    wallet_exists = db.query(Wallet).filter(
        Wallet.player_id == user.user_id,
        Wallet.tenant_id == tenant_id
    ).first()
    
    if not wallet_exists:
        raise HTTPException(
            status_code=403, 
            detail="Casino profile not initialized. Please enter via the Marketplace."
        )

    # 2. Query games enabled for THIS specific tenant
    # We join Game and TenantGame to filter by the tenant_id provided by the frontend
    games = db.query(Game).join(TenantGame, Game.game_id == TenantGame.game_id).filter(
        TenantGame.tenant_id == tenant_id,
        TenantGame.is_active == True,
        Game.status == "active"
    ).all()
    
    return games