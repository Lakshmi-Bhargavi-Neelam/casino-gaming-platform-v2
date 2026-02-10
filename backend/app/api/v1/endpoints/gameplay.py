from fastapi import APIRouter, Depends, HTTPException, Query # Added Query
from sqlalchemy.orm import Session
import uuid
from pydantic import BaseModel
from typing import Optional # Added Optional

from app.services.gameplay_service import GameplayService
from app.services.wallet_service import WalletService
from app.services.history_service import HistoryService
from app.core.security import get_db, get_current_user
from app.core.kyc_guard import enforce_kyc_verified

router = APIRouter(tags=["Gameplay"])


# 🎯 UPDATE THIS CLASS HERE
class PlayRequest(BaseModel):
    game_id: uuid.UUID
    bet_amount: float
    player_choice: Optional[str] = None
    target_multiplier: Optional[float] = None
    successful_picks: Optional[int] = None
    
    # 🎯 ADD THIS FIELD
    opt_in: bool = False 

@router.post("/play")
def play_game(req: PlayRequest, db: Session = Depends(get_db), user=Depends(get_current_user)):
    enforce_kyc_verified(user)
    return GameplayService.play_game(
        db,
        user.user_id,
        user.tenant_id,
        req.game_id,
        req.bet_amount,
        opt_in=req.opt_in,   # 🎯 PASS THIS
        player_choice=req.player_choice,   # 🎯 PASS TO SERVICE
        target_multiplier=req.target_multiplier,   # 🎯 ADD THIS
        successful_picks=req.successful_picks
    )


@router.post("/end-session/{game_id}")
def end_game_session(game_id: uuid.UUID, db: Session = Depends(get_db), user=Depends(get_current_user)):
    enforce_kyc_verified(user)
    return GameplayService.end_session(db, user.user_id, game_id)




@router.get("/wallet/dashboard")
def get_wallet_info(
    db: Session = Depends(get_db), 
    user = Depends(get_current_user),
    tx_type: Optional[str] = Query(None), # Filter by 'deposit', 'withdrawal', 'bet'
    month: Optional[str] = Query(None)     # Filter by 'YYYY-MM'
):
    enforce_kyc_verified(user)
    # Pass filters to the service layer
    data = WalletService.get_wallet_dashboard(db, user.user_id, tx_type=tx_type, month=month)
    if not data:
        raise HTTPException(status_code=404, detail="Wallet not found")
    return data

# Similarly update history if needed
@router.get("/history/dashboard")
def get_detailed_history(
    db: Session = Depends(get_db), 
    user = Depends(get_current_user)
):
    enforce_kyc_verified(user)
    return HistoryService.get_player_dashboard(db, user.user_id)