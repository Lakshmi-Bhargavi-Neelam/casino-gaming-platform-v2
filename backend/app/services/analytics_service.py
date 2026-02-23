from sqlalchemy.orm import Session
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy import func, desc
from datetime import date
from decimal import Decimal
import uuid

from app.models.analytics_snapshot import AnalyticsSnapshot
from app.models.player_stats_summary import PlayerStatsSummary
from app.models.tenant import Tenant


class AnalyticsService:

    # ─────────────────────────────────────
    # BET / GAMEPLAY ANALYTICS
    # ─────────────────────────────────────
    @staticmethod
    def update_bet_stats(
        db: Session,
        tenant_id: uuid.UUID,
        player_id: uuid.UUID,
        game_id: uuid.UUID,
        provider_id: uuid.UUID,
        bet_amount: float,
        win_amount: float,
    ):
        today = date.today()

        bet_dec = Decimal(str(bet_amount))
        win_dec = Decimal(str(win_amount))
        ggr_delta = bet_dec - win_dec

        win_inc = 1 if win_dec > 0 else 0
        loss_inc = 1 if win_dec == 0 else 0

        # Game-level snapshot
        stmt = insert(AnalyticsSnapshot).values(
            snapshot_date=today,
            tenant_id=tenant_id,
            game_id=game_id,
            provider_id=provider_id,
            total_bets=bet_dec,
            total_wins=win_dec,
            ggr=ggr_delta,
        ).on_conflict_do_update(
            index_elements=["snapshot_date", "tenant_id", "game_id"],
            set_={
                "total_bets": AnalyticsSnapshot.total_bets + bet_dec,
                "total_wins": AnalyticsSnapshot.total_wins + win_dec,
                "ggr": AnalyticsSnapshot.ggr + ggr_delta,
                "updated_at": func.now(),
            },
        )

        db.execute(stmt)

        # Player lifetime stats
        player_stmt = insert(PlayerStatsSummary).values(
            player_id=player_id,
            total_wagered=bet_dec,
            total_won=win_dec,
            net_pnl=win_dec - bet_dec,
            win_count=win_inc,
            loss_count=loss_inc,
            favorite_game_id=game_id,
            total_sessions=1,
            last_played_at=func.now(),
        ).on_conflict_do_update(
            index_elements=["player_id"],
            set_={
                "total_wagered": PlayerStatsSummary.total_wagered + bet_dec,
                "total_won": PlayerStatsSummary.total_won + win_dec,
                "net_pnl": PlayerStatsSummary.net_pnl + (win_dec - bet_dec),
                "win_count": PlayerStatsSummary.win_count + win_inc,
                "loss_count": PlayerStatsSummary.loss_count + loss_inc,
                "last_played_at": func.now(),
                "updated_at": func.now(),
            },
        )

        db.execute(player_stmt)

    # ─────────────────────────────────────
    #  FINANCIAL ANALYTICS
    # ─────────────────────────────────────
    @staticmethod
    def update_financial_stats(
        db: Session,
        tenant_id: uuid.UUID,
        player_id: uuid.UUID,
        amount: float,
        type: str,
    ):
        today = date.today()
        amount_dec = Decimal(str(amount))

        col = "total_deposits" if type == "deposit" else "total_withdrawals"

        stmt = insert(AnalyticsSnapshot).values(
            snapshot_date=today,
            tenant_id=tenant_id,
            **{col: amount_dec},
        ).on_conflict_do_update(
            index_elements=["snapshot_date", "tenant_id", "game_id"],  # ✅ FIXED
            set_={
                col: getattr(AnalyticsSnapshot, col) + amount_dec,
                "updated_at": func.now(),
            },
        )

        db.execute(stmt)

        # Player lifetime deposits
        if type == "deposit":
            p_stmt = insert(PlayerStatsSummary).values(
                player_id=player_id,
                total_deposits=amount_dec,
            ).on_conflict_do_update(
                index_elements=["player_id"],
                set_={
                    "total_deposits": PlayerStatsSummary.total_deposits + amount_dec,
                    "updated_at": func.now(),
                },
            )

            db.execute(p_stmt)

    # ─────────────────────────────────────
    # BONUS ANALYTICS
    # ─────────────────────────────────────
    @staticmethod
    def update_bonus_analytics(
        db: Session,
        tenant_id: uuid.UUID,
        amount: float,
        type: str,
    ):
        today = date.today()
        amount_dec = Decimal(str(amount))

        col = (
            "total_bonus_issued"
            if type == "issued"
            else "total_bonus_converted"
        )

        stmt = insert(AnalyticsSnapshot).values(
            snapshot_date=today,
            tenant_id=tenant_id,
            **{col: amount_dec},
        ).on_conflict_do_update(
            index_elements=["snapshot_date", "tenant_id", "game_id"],
            set_={
                col: getattr(AnalyticsSnapshot, col) + amount_dec,
                "updated_at": func.now(),
            },
        )

        db.execute(stmt)

    # ─────────────────────────────────────
    #  DASHBOARD AGGREGATIONS
    # ─────────────────────────────────────
    @staticmethod
    def get_global_platform_stats(db: Session):
        return db.query(
            func.sum(AnalyticsSnapshot.total_bets).label("total_volume"),
            func.sum(AnalyticsSnapshot.ggr).label("platform_ggr"),
            func.sum(AnalyticsSnapshot.total_wins).label("total_payouts"),
            func.sum(AnalyticsSnapshot.total_deposits).label("total_deposits"),
            func.sum(AnalyticsSnapshot.total_withdrawals).label("total_withdrawals"),
            func.sum(AnalyticsSnapshot.total_bonus_issued).label("total_bonuses"),
        ).first()

    @staticmethod
    def get_tenant_performance_breakdown(db: Session, limit: int = 10):
        return db.query(
            Tenant.tenant_name,
            Tenant.status,
            func.sum(AnalyticsSnapshot.total_bets).label("volume"),
            func.sum(AnalyticsSnapshot.ggr).label("ggr"),
        ).join(
            AnalyticsSnapshot,
            Tenant.tenant_id == AnalyticsSnapshot.tenant_id,
        ).group_by(
            Tenant.tenant_id
        ).order_by(
            desc("ggr")
        ).limit(limit).all()
