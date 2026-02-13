from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
import uuid
from app.models.user import User 
from app.core.database import get_db
from app.core.security import require_tenant_admin
from app.models.analytics_snapshot import AnalyticsSnapshot
from app.models.game import Game
from app.models.player_stats_summary import PlayerStatsSummary

# 🎯 ADDED: Prefix and Tags for better API Documentation
router = APIRouter(prefix="/tenant/analytics", tags=["Tenant Analytics"])

@router.get("/dashboard-summary")
def get_tenant_summary(
    db: Session = Depends(get_db), 
    user = Depends(require_tenant_admin)
):
    """
    Returns high-level KPIs and top-performing games for the logged-in Tenant.
    """
    # Ensure the user has a tenant_id (Safety check)
    if not user.tenant_id:
        raise HTTPException(status_code=403, detail="User not associated with a tenant")

    # 1. Fetch Aggregated Overview Stats
    stats = db.query(
        func.sum(AnalyticsSnapshot.total_bets).label("volume"),
        func.sum(AnalyticsSnapshot.ggr).label("revenue"),
        func.sum(AnalyticsSnapshot.total_wins).label("payouts")
    ).filter(AnalyticsSnapshot.tenant_id == user.tenant_id).first()

    # 2. Fetch Top Performing Games (by GGR/Profit)
    top_games_query = db.query(
        Game.game_name, 
        func.sum(AnalyticsSnapshot.ggr).label("profit")
    ).join(
        AnalyticsSnapshot, Game.game_id == AnalyticsSnapshot.game_id
    ).filter(
        AnalyticsSnapshot.tenant_id == user.tenant_id
    ).group_by(
        Game.game_name
    ).order_by(
        desc("profit")
    ).limit(5).all()

    # Calculate live RTP (Avoid division by zero)
    total_volume = float(stats.volume or 0)
    total_payouts = float(stats.payouts or 0)
    live_rtp = round((total_payouts / total_volume * 100), 2) if total_volume > 0 else 0

    return {
        "overview": {
            "total_wagered": total_volume,
            "total_revenue": float(stats.revenue or 0), # GGR
            "total_payouts": total_payouts,
            "rtp_live": live_rtp
        },
        "top_games": [
            {"name": g.game_name, "profit": float(g.profit)} 
            for g in top_games_query
        ]
    }

@router.get("/detailed-stats")
def get_tenant_business_intelligence(
    db: Session = Depends(get_db), 
    user = Depends(require_tenant_admin)
):
    # 1. Financial KPIs (Scoped to Current Tenant)
    stats = db.query(
        func.sum(AnalyticsSnapshot.total_bets).label("volume"),
        func.sum(AnalyticsSnapshot.ggr).label("ggr"),
        func.sum(AnalyticsSnapshot.total_bonus_issued).label("bonus_cost"),
        func.sum(AnalyticsSnapshot.total_deposits).label("deposits"),
        func.sum(AnalyticsSnapshot.total_withdrawals).label("withdrawals")
    ).filter(AnalyticsSnapshot.tenant_id == user.tenant_id).first()

    # 2. Player Behavior: Top 5 High Rollers
    top_players = db.query(
        User.first_name, 
        User.email, 
        PlayerStatsSummary.total_wagered
    ).join(PlayerStatsSummary, User.user_id == PlayerStatsSummary.player_id)\
     .filter(User.tenant_id == user.tenant_id)\
     .order_by(desc(PlayerStatsSummary.total_wagered)).limit(5).all()

    # 3. Marketing Efficiency Ratio
    # Revenue Generated per $1 spent on Bonuses
    bonus_cost = float(stats.bonus_cost or 0)
    ggr = float(stats.ggr or 0)
    efficiency_ratio = round(ggr / bonus_cost, 2) if bonus_cost > 0 else "N/A"

    return {
        "finance": {
            "ggr": ggr,
            "deposits": float(stats.deposits or 0),
            "withdrawals": float(stats.withdrawals or 0),
            "net_cash_flow": float((stats.deposits or 0) - (stats.withdrawals or 0))
        },
        "marketing": {
            "bonus_issued": bonus_cost,
            "efficiency_ratio": efficiency_ratio
        },
        "leaderboard": [
            {"name": p.first_name, "email": p.email, "wagered": float(p.total_wagered)} 
            for p in top_players
        ]
    }