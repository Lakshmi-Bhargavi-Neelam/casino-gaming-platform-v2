from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import require_super_admin, get_current_user
from app.core.kyc_guard import enforce_kyc_verified

from app.models.game_provider import GameProvider

from app.schemas.game_provider import GameProviderCreate

from app.services.game_provider_service import GameProviderService
from app.services.game_service import GameService

router = APIRouter(tags=["Game Providers"])

@router.post("")
def create_game_provider(
    payload: GameProviderCreate,
    db: Session = Depends(get_db),
    _=Depends(require_super_admin),  
):
    return GameProviderService.create_provider(db, payload)

@router.get("/my-games")
def list_my_games(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    enforce_kyc_verified(current_user)
    provider = db.query(GameProvider).filter(GameProvider.provider_id == current_user.user_id).first()
    if not provider:
        raise HTTPException(status_code=403, detail="Not a registered game provider")

    games = GameService.get_provider_games(db, provider.provider_id)
    
    return [
        {
            "game_id": g.game_id,
            "game_name": g.game_name,
            "rtp_percentage": g.rtp_percentage,
            "status": g.status,
            "engine_type": g.engine_type,     
            "engine_config": g.engine_config, 
            "volatility": g.volatility,      
            "min_bet": float(g.min_bet),      
            "max_bet": float(g.max_bet)     
        } for g in games
    ]