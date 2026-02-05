from sqlalchemy.orm import Session
from app.models.tenant_game import TenantGame
from app.models.game import Game
from app.models.game_provider import GameProvider


class LobbyService:

    @staticmethod
    def get_lobby_games(db: Session, tenant_id):
        rows = (
            db.query(TenantGame, Game, GameProvider)
            .join(Game, Game.game_id == TenantGame.game_id)
            .join(GameProvider, GameProvider.provider_id == Game.provider_id)
            .filter(
                TenantGame.tenant_id == tenant_id,
                TenantGame.is_active == True,
                TenantGame.status == "active",
                Game.status == "active"
            )
            .all()
        )

        return [
            {
                # 🎮 GAME INFO
                "game_id": game.game_id,
                "game_name": game.game_name,
                "game_code": game.game_code,
                "volatility": game.volatility,
                "engine_type": game.engine_type,  # 🎯 ADD THIS LINE!
                # 🏢 PROVIDER
                "provider_name": provider.provider_name,

                # 🏢 TENANT RULES
                "rtp_percentage": float(tg.rtp_override or game.rtp_percentage),
                "min_bet": float(tg.min_bet or game.min_bet),
                "max_bet": float(tg.max_bet or game.max_bet),
            }
            for tg, game, provider in rows
        ]
