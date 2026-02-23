from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from datetime import datetime, timezone
import uuid

from app.models.game import Game, GameStatusEnum
from app.models.game_provider import GameProvider
from app.models.game_category import GameCategory


class GameService:

    @staticmethod
    def submit_game(db: Session, payload, provider_id: uuid.UUID):
        #  Validate provider
        provider = db.query(GameProvider).filter(
            GameProvider.provider_id == provider_id,
            GameProvider.is_active.is_(True)
        ).first()
        if not provider:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or inactive game provider"
            )

        # Validate category
        category = db.query(GameCategory).filter(
            GameCategory.category_id == payload.category_id
        ).first()
        if not category:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid game category"
            )

        #Prevent duplicate game code globally
        existing_game = db.query(Game).filter(
            Game.game_code == payload.game_code
        ).first()
        if existing_game:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Game code already exists"
            )

        # Create game with Engine Configuration
        game = Game(
            provider_id=provider_id,
            category_id=payload.category_id,
            game_name=payload.game_name,
            game_code=payload.game_code,
            rtp_percentage=payload.rtp_percentage,
            volatility=payload.volatility.lower() if payload.volatility else None,
            min_bet=payload.min_bet,
            max_bet=payload.max_bet,

            # Engine Fields
            engine_type=payload.engine_type,
            engine_config=payload.engine_config,

            status=GameStatusEnum.PENDING,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )

        db.add(game)
        db.commit()
        db.refresh(game)
        return game

    @staticmethod
    def approve_game(db: Session, game_id: uuid.UUID):
        """
        SUPER ADMIN approves a pending game.
        """
        game = db.query(Game).filter(Game.game_id == game_id).first()

        if not game:
            raise HTTPException(status_code=404, detail="Game not found")

        if game.status != GameStatusEnum.PENDING:
            raise HTTPException(
                status_code=400,
                detail=f"Cannot approve game with status: {game.status}"
            )

        game.status = GameStatusEnum.ACTIVE
        game.updated_at = datetime.now(timezone.utc)

        db.commit()
        db.refresh(game)
        return game

    @staticmethod
    def deactivate_game(db: Session, game_id: uuid.UUID):
        """
        SUPER ADMIN rejects a pending game OR deactivates an active one.
        Sets status to 'inactive'.
        """
        game = db.query(Game).filter(Game.game_id == game_id).first()

        if not game:
            raise HTTPException(status_code=404, detail="Game not found")

        if game.status == GameStatusEnum.INACTIVE:
            raise HTTPException(status_code=400, detail="Game is already inactive")

        game.status = GameStatusEnum.INACTIVE
        game.updated_at = datetime.now(timezone.utc)

        db.commit()
        db.refresh(game)
        return game

    @staticmethod
    def get_provider_games(db: Session, provider_id: uuid.UUID):
        """
        Fetch all games submitted by a specific provider.
        """
        return db.query(Game).filter(Game.provider_id == provider_id).all()
