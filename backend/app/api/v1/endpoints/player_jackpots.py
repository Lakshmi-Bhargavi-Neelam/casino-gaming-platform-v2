from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.security import get_current_player
from app.services.jackpot_service import JackpotService
from app.schemas.jackpot import JackpotContribution
from app.core.database import get_db
from uuid import UUID
import uuid
from app.models.player import Player
from app.models.user import User
from app.models.jackpot import Jackpot
from app.models.jackpot_win import JackpotWin

router = APIRouter(prefix="/player/jackpots", tags=["Player Jackpots"])

@router.get("/active")
def get_active_jackpots(user=Depends(get_current_player), db=Depends(get_db)):
    return db.query(Jackpot).filter(
        Jackpot.tenant_id == user.tenant_id,
        Jackpot.status == "ACTIVE"
    ).all()

@router.post("/{jackpot_id}/contribute")
def contribute(jackpot_id: uuid.UUID, payload: JackpotContribution, user=Depends(get_current_player), db=Depends(get_db)):
    return JackpotService.contribute_to_sponsored(db, user.user_id, jackpot_id, payload.amount)

@router.get("/history")
def get_jackpot_history(db: Session = Depends(get_db), user = Depends(get_current_player)):
    # 🎯 1. Get recent global winners (Explicit Join to get Email & Jackpot Name)
    recent_results = db.query(JackpotWin, User.email, Jackpot.jackpot_name).join(
        Jackpot, JackpotWin.jackpot_id == Jackpot.jackpot_id
    ).join(
        User, JackpotWin.player_id == User.user_id
    ).filter(
        Jackpot.tenant_id == user.tenant_id
    ).order_by(JackpotWin.won_at.desc()).limit(10).all()

    # Manual format for Recent Winners
    recent_formatted = []
    for win, email, jp_name in recent_results:
        recent_formatted.append({
            "jackpot_win_id": str(win.jackpot_win_id),
            "win_amount": float(win.win_amount),
            "won_at": win.won_at,
            # Frontend expects: win.user.email
            "user": { "email": email },
            # Frontend expects: win.jackpot.jackpot_name
            "jackpot": { "jackpot_name": jp_name }
        })

    # 🎯 2. Get this specific player's wins (Explicit Join to get Jackpot Name)
    my_results = db.query(JackpotWin, Jackpot.jackpot_name).join(
        Jackpot, JackpotWin.jackpot_id == Jackpot.jackpot_id
    ).filter(
        JackpotWin.player_id == user.user_id
    ).order_by(JackpotWin.won_at.desc()).all()

    # Manual format for My Wins
    my_formatted = []
    for win, jp_name in my_results:
        my_formatted.append({
            "jackpot_win_id": str(win.jackpot_win_id),
            "win_amount": float(win.win_amount),
            "won_at": win.won_at,
            "jackpot": { "jackpot_name": jp_name }
        })

    return {
        "recent_winners": recent_formatted,
        "my_wins": my_formatted
    }