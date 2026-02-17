from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from app.core.database import get_db
from app.models.tenant import Tenant
from app.models.user import User
from app.models.game_provider import GameProvider
from app.models.analytics_snapshot import AnalyticsSnapshot
from app.models.player_stats_summary import PlayerStatsSummary
from app.models.game import Game
import uuid

router = APIRouter(prefix="/super-admin/analytics", tags=["Super Admin Analytics"])


@router.get("/intelligence")
def get_intelligence(
    tenant_id: uuid.UUID = Query(None),
    db: Session = Depends(get_db)
):
    # ─────────────────────────────
    # Base Filters
    # ─────────────────────────────
    filters = []
    if tenant_id:
        filters.append(AnalyticsSnapshot.tenant_id == tenant_id)

    # ─────────────────────────────
    # Core Aggregates
    # ─────────────────────────────
    stats = db.query(
        func.coalesce(func.sum(AnalyticsSnapshot.total_bets), 0).label("volume"),
        func.coalesce(func.sum(AnalyticsSnapshot.ggr), 0).label("ggr"),
        func.coalesce(func.sum(AnalyticsSnapshot.total_wins), 0).label("wins"),
        func.coalesce(func.sum(AnalyticsSnapshot.total_deposits), 0).label("deposits"),
    ).filter(*filters).first()

    volume = float(stats.volume)
    wins = float(stats.wins)

    rtp = round((wins / volume) * 100, 2) if volume > 0 else 0

    # ─────────────────────────────
    # Counts
    # ─────────────────────────────
    if tenant_id:
        active_players = db.query(User).filter(User.tenant_id == tenant_id).count()
        active_tenants = 1
    else:
        active_players = db.query(User).count()
        active_tenants = db.query(Tenant).filter(Tenant.status == "active").count()

    active_providers = db.query(GameProvider).count()

    # ─────────────────────────────
    # Top Performers
    # ─────────────────────────────
    if not tenant_id:
        # ✅ GLOBAL → TOP TENANTS
        top_performers = (
            db.query(
                Tenant.tenant_id.label("id"),
                Tenant.tenant_name.label("name"),
                func.coalesce(func.sum(AnalyticsSnapshot.ggr), 0).label("value"),
            )
            .join(AnalyticsSnapshot, AnalyticsSnapshot.tenant_id == Tenant.tenant_id)
            .group_by(Tenant.tenant_id, Tenant.tenant_name)
            .order_by(desc("value"))
            .limit(5)
            .all()
        )
    else:
        # ✅ TENANT VIEW → TOP GAMES
        top_performers = (
            db.query(
                Game.game_id.label("id"),
                Game.game_name.label("name"),
                func.coalesce(func.sum(AnalyticsSnapshot.ggr), 0).label("value"),
            )
            .join(AnalyticsSnapshot, AnalyticsSnapshot.game_id == Game.game_id)
            .filter(AnalyticsSnapshot.tenant_id == tenant_id)
            .group_by(Game.game_id, Game.game_name)
            .order_by(desc("value"))
            .limit(5)
            .all()
        )

    # ─────────────────────────────
    # Top Players
    # ─────────────────────────────
    player_filters = [User.tenant_id == tenant_id] if tenant_id else []

    top_players = (
        db.query(
            User.first_name.label("name"),
            func.coalesce(PlayerStatsSummary.total_wagered, 0).label("staked"),
        )
        .join(PlayerStatsSummary, User.user_id == PlayerStatsSummary.player_id)
        .filter(*player_filters)
        .order_by(desc("staked"))
        .limit(5)
        .all()
    )

    # ─────────────────────────────
    # Regional Data
    # ─────────────────────────────
    regional = (
        db.query(
            AnalyticsSnapshot.country_code.label("country"),
            func.coalesce(func.sum(AnalyticsSnapshot.ggr), 0).label("revenue"),
        )
        .filter(*filters)
        .group_by(AnalyticsSnapshot.country_code)
        .all()
    )

    # ─────────────────────────────
    # Response
    # ─────────────────────────────
    return {
        "is_tenant_view": bool(tenant_id),
        "kpis": {
            "ggr": float(stats.ggr),
            "volume": volume,
            "rtp": rtp,
            "deposits": float(stats.deposits),
            "tenants": active_tenants,
            "players": active_players,
            "providers": active_providers,
        },
        "top_list": [
            {
                "id": str(i.id),
                "name": i.name,
                "val": float(i.value),
            }
            for i in top_performers
        ],
        "top_players": [
            {
                "name": p.name,
                "staked": float(p.staked),
            }
            for p in top_players
        ],
        "regions": [
            {
                "country": r.country or "Unknown",
                "revenue": float(r.revenue),
            }
            for r in regional
        ],
    }
