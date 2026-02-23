from sqlalchemy.orm import Session
from sqlalchemy import func, desc
import uuid

from app.models.game_round import GameRound
from app.models.game_session import GameSession
from app.models.game import Game
from app.models.wallet_transaction import WalletTransaction


class HistoryService:

    @staticmethod
    def get_player_dashboard(db: Session, player_id: uuid.UUID, game_name: str = None, status: str = None, limit: int = 50):
        stats = (
            db.query(
                func.sum(GameRound.bet_amount).label("total_wagered"),
                func.sum(GameRound.win_amount).label("total_won"),
                func.max(GameRound.win_amount).label("biggest_hit"),
            )
            .join(GameSession, GameRound.session_id == GameSession.session_id)
            .filter(GameSession.player_id == player_id)
            .first()
        )

        query = (
            db.query(
                GameRound.round_id,
                Game.game_name,
                GameRound.bet_amount,
                GameRound.win_amount,
                GameRound.result_data,
                GameRound.started_at,
                WalletTransaction.balance_after,
            )
            .join(GameSession, GameRound.session_id == GameSession.session_id)
            .join(Game, GameSession.game_id == Game.game_id)
            .outerjoin(WalletTransaction, WalletTransaction.reference_id == GameRound.round_id)
            .filter(GameSession.player_id == player_id)
        )
        if game_name and game_name != 'all':
            query = query.filter(Game.game_name == game_name)
        
        if status == 'wins':
            query = query.filter(GameRound.win_amount > 0)
        elif status == 'losses':
            query = query.filter(GameRound.win_amount <= 0)

        history_results = query.order_by(desc(GameRound.started_at)).limit(limit).all()

        return {
            "summary": {
                "wagered": float(stats.total_wagered or 0),
                "won": float(stats.total_won or 0),
                "max_win": float(stats.biggest_hit or 0),
                "profit": float((stats.total_won or 0) - (stats.total_wagered or 0)),
            },
            "history": [
                {
                    "round_id": str(row.round_id),
                    "game_name": row.game_name,
                    "bet_amount": float(row.bet_amount or 0),
                    "win_amount": float(row.win_amount or 0),
                    "result_data": row.result_data,
                    "date": row.started_at.isoformat() if row.started_at else None,
                    "balance_after": float(row.balance_after) if row.balance_after is not None else None,
                }
                for row in history_results
            ],
        }
