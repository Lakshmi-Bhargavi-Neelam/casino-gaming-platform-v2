from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.core.security import get_current_player

from app.models.player_stats_summary import PlayerStatsSummary
from app.models.bonus_usage import BonusUsage
from app.models.game import Game

router = APIRouter(prefix="/player/analytics", tags=["Player Analytics"])

@router.get("/personal-hub")
def get_player_stats(db: Session = Depends(get_db), player = Depends(get_current_player)):
    stats = db.query(PlayerStatsSummary).filter(
        PlayerStatsSummary.player_id == player.user_id
    ).first()

    if not stats:
        return {"has_data": False}

    try:
        wagered = float(stats.total_wagered or 0)
        won = float(stats.total_won or 0)
        deposited = float(getattr(stats, 'total_deposits', 0) or 0)
        play_seconds = int(getattr(stats, 'total_play_time_seconds', 0) or 0)
        
        experienced_rtp = round((won / wagered) * 100, 2) if wagered > 0 else 0
        net_pnl = float(stats.net_pnl or 0)
        current_loss = abs(min(net_pnl, 0))
        loss_ratio = round((current_loss / deposited) * 100, 2) if deposited > 0 else 0

        active_bonus = db.query(BonusUsage).filter(
            BonusUsage.player_id == player.user_id,
            BonusUsage.status == "active"
        ).first()

        return {
            "has_data": True,
            "kpis": {
                "total_wagered": wagered,
                "total_won": won,
                "net_result": net_pnl,
                "experienced_rtp": experienced_rtp,
                "sessions": stats.total_sessions or 0
            },
            "responsible_gaming": {
                "loss_to_deposit_ratio": loss_ratio,
                "play_time_hours": round(play_seconds / 3600, 1),
                "status": "Healthy" if loss_ratio < 70 else "Action Recommended"
            },
            "bonus": {
                "active": bool(active_bonus),
                "progress": round((float(active_bonus.wagering_completed or 0) / float(active_bonus.wagering_required or 1)) * 100, 1) if active_bonus else 0
            }
        }
    except Exception as e:
        print(f"ANALYTICS ENGINE CRASH: {str(e)}")
        raise HTTPException(status_code=500, detail="Personal ledger processing failed")