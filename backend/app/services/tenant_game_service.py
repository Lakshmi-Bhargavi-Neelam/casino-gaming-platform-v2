from sqlalchemy.orm import Session
from fastapi import HTTPException
from datetime import datetime

from app.models.tenant_game import TenantGame
from app.models.game import Game, GameStatusEnum
from app.models.game_provider import GameProvider


class TenantGameService:

    # Marketplace listing
    @staticmethod
    def list_available_market_games(db: Session, tenant_id):
        games = (
            db.query(Game)
            .join(GameProvider)
            .filter(Game.status == GameStatusEnum.ACTIVE)
            .all()
        )

        result = []

        for g in games:
            tg = db.query(TenantGame).filter_by(
                tenant_id=tenant_id,
                game_id=g.game_id,
                is_active=True
            ).first()

            result.append({
                "game_id": g.game_id,
                "game_name": g.game_name,
                "provider_name": g.provider.provider_name,
                "tenant_min_bet": tg.min_bet if tg and tg.min_bet else g.min_bet,
                "tenant_max_bet": tg.max_bet if tg and tg.max_bet else g.max_bet,
                "rtp_percentage": tg.rtp_override if tg and tg.rtp_override else g.rtp_percentage,
                "volatility": g.volatility,
                "engine_type": g.engine_type,
                "engine_config": g.engine_config,
                "is_enabled": bool(tg)
            })

        return result

    # Enable Game
    @staticmethod
    def enable_game(db: Session, tenant_id, game_id):
        game = db.query(Game).filter_by(
            game_id=game_id,
            status=GameStatusEnum.ACTIVE
        ).first()

        if not game:
            raise HTTPException(404, "Game not found or not active")

        tg = db.query(TenantGame).filter_by(
            tenant_id=tenant_id,
            game_id=game_id
        ).first()

        if tg:
            tg.status = "active"
            tg.is_active = True
            tg.updated_at = datetime.utcnow()
        else:
            tg = TenantGame(
                tenant_id=tenant_id,
                game_id=game_id,
                is_active=True,
                status="active",
                updated_at=datetime.utcnow()
            )
            db.add(tg)

        db.commit()
        return {"message": "Game enabled"}

    # Disable Game
    @staticmethod
    def disable_game(db: Session, tenant_id, game_id):
        tg = db.query(TenantGame).filter_by(
            tenant_id=tenant_id,
            game_id=game_id
        ).first()

        if not tg:
            raise HTTPException(404, "Game not found for tenant")

        tg.status = "inactive"
        tg.is_active = False
        tg.updated_at = datetime.utcnow()

        db.commit()
        return {"message": "Game disabled"}

    # Update overrides
    @staticmethod
    def update_overrides(db: Session, tenant_id, game_id, min_bet, max_bet, rtp_override):
        tg = db.query(TenantGame).filter_by(
            tenant_id=tenant_id,
            game_id=game_id
        ).first()

        if not tg:
            raise HTTPException(404, "Game not enabled for tenant")

        if min_bet is not None:
            tg.min_bet = min_bet
        if max_bet is not None:
            tg.max_bet = max_bet
        if rtp_override is not None:
            tg.rtp_override = rtp_override

        tg.updated_at = datetime.utcnow()
        db.commit()

        return {"message": "Overrides updated"}

    # List enabled games for tenant
    @staticmethod
    def list_enabled_games(db: Session, tenant_id):
        rows = (
            db.query(TenantGame)
            .join(Game)
            .join(GameProvider)
            .filter(
                TenantGame.tenant_id == tenant_id,
                TenantGame.is_active == True
            )
            .all()
        )

        return [
            {
                "game_id": tg.game_id,
                "game_name": tg.game.game_name,
                "provider_name": tg.game.provider.provider_name,
                "min_bet": tg.min_bet or tg.game.min_bet,
                "max_bet": tg.max_bet or tg.game.max_bet,
                "rtp": tg.rtp_override or tg.game.rtp_percentage,
                "volatility": tg.game.volatility,
                "engine_type": tg.game.engine_type
            }
            for tg in rows
        ]
