from sqlalchemy.orm import Session
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy import func
from app.models.analytics_snapshot import AnalyticsSnapshot
from app.models.player_stats_summary import PlayerStatsSummary
from datetime import date
from decimal import Decimal
import uuid

class AnalyticsService:

    @staticmethod
    def update_bet_stats(db: Session, tenant_id: uuid.UUID, player_id: uuid.UUID, game_id: uuid.UUID, provider_id: uuid.UUID, bet_amount: float, win_amount: float):
        today = date.today()
        bet_dec = Decimal(str(bet_amount))
        win_dec = Decimal(str(win_amount))
        ggr_delta = bet_dec - win_dec
        
        # 🎯 Logic: determine if this was a win or loss for the player
        win_inc = 1 if win_dec > 0 else 0
        loss_inc = 1 if win_dec == 0 else 0

        # 1. Update Tenant Daily Snapshot
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

        # 2. Update Player Lifetime Summary (Includes Win/Loss counts)
        player_stmt = insert(PlayerStatsSummary).values(
            player_id=player_id,
            total_wagered=bet_dec,
            total_won=win_dec,
            net_pnl=win_dec - bet_dec,
            win_count=win_inc,
            loss_count=loss_inc,
            favorite_game_id=game_id,
            total_sessions=1,
            last_played_at=func.now()
        ).on_conflict_do_update(
            index_elements=["player_id"],
            set_={
                "total_wagered": PlayerStatsSummary.total_wagered + bet_dec,
                "total_won": PlayerStatsSummary.total_won + win_dec,
                "net_pnl": PlayerStatsSummary.net_pnl + (win_dec - bet_dec),
                "win_count": PlayerStatsSummary.win_count + win_inc,
                "loss_count": PlayerStatsSummary.loss_count + loss_inc,
                "last_played_at": func.now(),
                "updated_at": func.now()
            }
        )
        db.execute(player_stmt)

    @staticmethod
    def update_financial_stats(db: Session, tenant_id: uuid.UUID, player_id: uuid.UUID, amount: float, type: str):
        """
        🎯 Updates Tenant snapshots AND Player lifetime deposit totals.
        """
        today = date.today()
        amount_dec = Decimal(str(amount))
        col = "total_deposits" if type == "deposit" else "total_withdrawals"

        # 1. Update Tenant Snapshot
        stmt = insert(AnalyticsSnapshot).values(
            snapshot_date=today,
            tenant_id=tenant_id,
            game_id=None, 
            **{col: amount_dec}
        ).on_conflict_do_update(
            constraint="analytics_snapshots_snapshot_date_tenant_id_game_id_key",
            set_={
                col: getattr(AnalyticsSnapshot, col) + amount_dec,
                "updated_at": func.now()
            }
        )
        db.execute(stmt)

        # 2. 🎯 If it's a deposit, update the Player's lifetime deposit stat
        if type == "deposit":
            p_stmt = insert(PlayerStatsSummary).values(
                player_id=player_id,
                total_deposits=amount_dec
            ).on_conflict_do_update(
                index_elements=["player_id"],
                set_={
                    "total_deposits": PlayerStatsSummary.total_deposits + amount_dec,
                    "updated_at": func.now()
                }
            )
            db.execute(p_stmt)

    @staticmethod
    def update_bonus_analytics(db: Session, tenant_id: uuid.UUID, amount: float, type: str):
        today = date.today()
        amount_dec = Decimal(str(amount))
        col = "total_bonus_issued" if type == "issued" else "total_bonus_converted"

        stmt = insert(AnalyticsSnapshot).values(
            snapshot_date=today,
            tenant_id=tenant_id,
            game_id=None,
            **{col: amount_dec}
        ).on_conflict_do_update(
            constraint="analytics_snapshots_snapshot_date_tenant_id_game_id_key",
            set_={
                col: getattr(AnalyticsSnapshot, col) + amount_dec,
                "updated_at": func.now()
            }
        )
        db.execute(stmt)