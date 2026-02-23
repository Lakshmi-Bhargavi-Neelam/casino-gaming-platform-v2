from fastapi import APIRouter, Depends, HTTPException, Query 
from sqlalchemy.orm import Session
import uuid
from uuid import UUID
from pydantic import BaseModel
from typing import Optional

from app.core.security import get_db, get_current_user
from app.core.kyc_guard import enforce_kyc_verified

from app.schemas.gameplay import PlayRequest

from app.services.gameplay_service import GameplayService
from app.services.wallet_service import WalletService
from app.services.history_service import HistoryService


router = APIRouter(tags=["Gameplay"])

@router.post("/play")
def play_game(req: PlayRequest, db: Session = Depends(get_db), user=Depends(get_current_user)):
    enforce_kyc_verified(user)
    return GameplayService.play_game(
        db,
        user.user_id,
        req.tenant_id,
        req.game_id,
        req.bet_amount,
        opt_in=req.opt_in,
        player_choice=req.player_choice,   
        target_multiplier=req.target_multiplier,  
        successful_picks=req.successful_picks
    )


@router.post("/end-session/{game_id}")
def end_game_session(
    game_id: uuid.UUID, 
    tenant_id: uuid.UUID,  
    db: Session = Depends(get_db), 
    user = Depends(get_current_user)
):
    enforce_kyc_verified(user)
    return GameplayService.end_session(db, user.user_id, game_id, tenant_id)


@router.get("/wallet/dashboard")
def get_wallet_info(
    db: Session = Depends(get_db), 
    user = Depends(get_current_user),
    tenant_id: uuid.UUID = Query(...), 
    tx_type: Optional[str] = Query(None), 
    month: Optional[str] = Query(None)    
):
    enforce_kyc_verified(user)
    data = WalletService.get_wallet_dashboard(db, user.user_id,tenant_id, tx_type=tx_type, month=month)
    if not data:
        raise HTTPException(status_code=404, detail="Wallet not found")
    return data

@router.get("/history/dashboard")
def get_detailed_history(
    db: Session = Depends(get_db), 
    user = Depends(get_current_user),
    game: Optional[str] = Query(None),
    status: Optional[str] = Query(None) 
):
    enforce_kyc_verified(user)
    return HistoryService.get_player_dashboard(
        db, 
        user.user_id, 
        game_name=game, 
        status=status
    )