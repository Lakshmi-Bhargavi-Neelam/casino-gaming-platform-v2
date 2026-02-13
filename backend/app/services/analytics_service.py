from sqlalchemy.orm import Session
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy import func # 🎯 Essential for updated_at
from app.models.analytics_snapshot import AnalyticsSnapshot
from app.models.player_stats_summary import PlayerStatsSummary
from datetime import date
from decimal import Decimal
import uuid

class AnalyticsService:

    @staticmethod
    def update_bet_stats(db: Session, tenant_id: uuid.UUID, player_id: uuid.UUID, game_id: uuid.UUID, provider_id: uuid.UUID, bet_amount: float, win_amount: float):
        """
        🎯 Live Update: Increments Tenant daily stats and Player lifetime stats.
        """
        today = date.today()
        bet_dec = Decimal(str(bet_amount))
        win_dec = Decimal(str(win_amount))
        ggr_delta = bet_dec - win_dec

        # 1. Update Daily Snapshot (Tenant Level)
        # Using the exact constraint name from your screenshot
        stmt = insert(AnalyticsSnapshot).values(
            snapshot_date=today,
            tenant_id=tenant_id,
            game_id=game_id,
            provider_id=provider_id,
            total_bets=bet_dec,
            total_wins=win_dec,
            ggr=ggr_delta
        ).on_conflict_do_update(
            constraint="analytics_snapshots_snapshot_date_tenant_id_game_id_key",
            set_={
                "total_bets": AnalyticsSnapshot.total_bets + bet_dec,
                "total_wins": AnalyticsSnapshot.total_wins + win_dec,
                "ggr": AnalyticsSnapshot.ggr + ggr_delta,
                "updated_at": func.now()
            }
        )
        db.execute(stmt)

        # 2. Update Player Lifetime Summary
        player_stmt = insert(PlayerStatsSummary).values(
            player_id=player_id,
            total_wagered=bet_dec,
            total_won=win_dec,
            net_pnl=win_dec - bet_dec,
            favorite_game_id=game_id,
            total_sessions=1,
            last_played_at=func.now()
        ).on_conflict_do_update(
            index_elements=["player_id"],
            set_={
                "total_wagered": PlayerStatsSummary.total_wagered + bet_dec,
                "total_won": PlayerStatsSummary.total_won + win_dec,
                "net_pnl": PlayerStatsSummary.net_pnl + (win_dec - bet_dec),
                "last_played_at": func.now(),
                "updated_at": func.now()
            }
        )
        db.execute(player_stmt)

    @staticmethod
    def update_financial_stats(db: Session, tenant_id: uuid.UUID, amount: float, type: str):
        """
        🎯 Triggered on Deposit or Withdrawal.
        Updates the 'total_deposits' or 'total_withdrawals' for today.
        """
        today = date.today()
        amount_dec = Decimal(str(amount))
        
        # Columns to update based on type
        col = "total_deposits" if type == "deposit" else "total_withdrawals"

        stmt = insert(AnalyticsSnapshot).values(
            snapshot_date=today,
            tenant_id=tenant_id,
            game_id=None, # 👈 Crucial
            **{col: amount_dec}
        ).on_conflict_do_update(
            constraint="analytics_snapshots_snapshot_date_tenant_id_game_id_key",
            set_={
                col: getattr(AnalyticsSnapshot, col) + amount_dec,
                "updated_at": func.now()
            }
        )
        db.execute(stmt)

    @staticmethod
    def update_bonus_analytics(db: Session, tenant_id: uuid.UUID, amount: float, type: str):
        """
        🎯 Tracks marketing cost.
        type: 'issued' (when bonus granted) or 'converted' (when points become cash)
        """
        today = date.today()
        amount_dec = Decimal(str(amount))
        col = "total_bonus_issued" if type == "issued" else "total_bonus_converted"

        stmt = insert(AnalyticsSnapshot).values(
            snapshot_date=today,
            tenant_id=tenant_id,
            **{col: amount_dec}
        ).on_conflict_do_update(
            constraint="analytics_snapshots_snapshot_date_tenant_id_game_id_key",
            set_={col: getattr(AnalyticsSnapshot, col) + amount_dec}
        )
        db.execute(stmt)