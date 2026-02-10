import uuid
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException

from app.models.game import Game
from app.models.game_round import GameRound
from app.models.bet import Bet
from app.models.tenant_game import TenantGame
from app.models.game_session import GameSession
from app.game_engines.slot_engine import SlotEngine
from app.services.wallet_service import WalletService
from app.game_engines.dice_engine import DiceEngine # Ensure this is imported
from app.game_engines.mines_engine import MinesEngine
from app.services.bonus_service import BonusService # 🎯 1. IMPORT BONUS SERVICE
from app.services.jackpot_service import JackpotService # 🎯 Import this
from app.game_engines.crash_engine import CrashEngine 



class GameplayService:

    @staticmethod
    def get_engine(game: Game):
        if game.engine_type in ["slot", "slot_engine"]:
           return SlotEngine(game.engine_config)
        if game.engine_type in ["dice", "dice_engine"]:
           return DiceEngine(game.engine_config) # 🎯 Added Dice Support
        if game.engine_type in ["crash", "crash_engine"]:     # 🎯 ADD THIS
           return CrashEngine(game.engine_config)
        if game.engine_type in ["mines", "mines_engine"]:
           return MinesEngine(game.engine_config)  # ✅ ADD THIS
        raise HTTPException(status_code=400, detail="Unsupported engine type")

    @staticmethod
    def play_game(
        db: Session,
        player_id: uuid.UUID,
        tenant_id: uuid.UUID,
        game_id: uuid.UUID,
        bet_amount: float,
        opt_in: bool = False, # 🎯 Confirmed: Added opt_in arg
        **kwargs 
    ):
        session = None
        try:
            # ─────────────────────────────
            # GAME VALIDATION
            # ─────────────────────────────
            game = db.query(Game).filter(
                Game.game_id == game_id,
                Game.status == "active"
            ).first()
            if not game:
                raise HTTPException(status_code=404, detail="Game not available")

            tenant_game = db.query(TenantGame).filter(
                TenantGame.game_id == game_id,
                TenantGame.tenant_id == tenant_id,
                TenantGame.is_active == True
            ).first()
            if not tenant_game:
                raise HTTPException(status_code=403, detail="Game not enabled for tenant")

            wallet = WalletService.get_wallet(db, player_id, "CASH")
            engine = GameplayService.get_engine(game)

            engine.validate_bet(
                bet_amount,
                tenant_game.min_bet or game.min_bet,
                tenant_game.max_bet or game.max_bet
            )

            # ─────────────────────────────
            # SESSION CREATION
            # ─────────────────────────────
            session = db.query(GameSession).filter(
                GameSession.player_id == player_id,
                GameSession.game_id == game_id,
                GameSession.status == "active"
            ).first()

            if not session:
                session = GameSession(
                    player_id=player_id,
                    game_id=game_id,
                    tenant_id=tenant_id,
                    status="active"
                )
                db.add(session)
                db.flush()

            # ─────────────────────────────
            # ROUND CREATION
            # ─────────────────────────────
            last_round_no = db.query(func.max(GameRound.round_number)).filter(
                GameRound.session_id == session.session_id
            ).scalar()

            round_obj = GameRound(
                session_id=session.session_id,
                round_number=(last_round_no or 0) + 1,
                started_at=datetime.utcnow(),
                bet_amount=bet_amount
            )
            db.add(round_obj)
            db.flush() 

            # ─────────────────────────────
            # BET RECORD
            # ─────────────────────────────
            bet = Bet(
                round_id=round_obj.round_id,
                wallet_id=wallet.wallet_id,
                bet_amount=bet_amount,
                win_amount=0,
                bet_currency_id=wallet.currency_id,
                bet_status="placed",
                placed_at=datetime.utcnow(),
            )
            db.add(bet)
            db.flush()

            # ─────────────────────────────
            # 🎯 JACKPOT SPLIT LOGIC
            # ─────────────────────────────
            game_stake = bet_amount # Default: Full amount goes to game
            
            if opt_in:
                # Import here to avoid circular imports if necessary
                from app.services.jackpot_service import JackpotService
                
                # This calculates the split, updates the jackpot pool, records contribution,
                # and returns the REMAINING amount to be used for the game (e.g. $99)
                game_stake = JackpotService.process_progressive_bet(
                    db,
                     player_id,
                     tenant_id, 
                     bet_amount,
                     bet_id=bet.bet_id 
                )

            # ─────────────────────────────
            # WALLET DEBIT (FULL AMOUNT)
            # ─────────────────────────────
            # Note: We debit the user for the TOTAL they agreed to pay (e.g., $100)
            WalletService.apply_transaction(
                db,
                wallet,
                bet_amount,
                "bet",
                "bet",
                round_obj.round_id 
            )

            # ─────────────────────────────
            # BONUS WAGERING (GAME STAKE)
            # ─────────────────────────────
            # Fair Play: Only the amount risked on the game (e.g., $99) counts for wagering
            BonusService.apply_wagering(db, player_id=player_id, bet_amount=game_stake)

            # ─────────────────────────────
            # GAME ENGINE EXECUTION (GAME STAKE)
            # ─────────────────────────────
            # Engine runs on the reduced stake ($99), so wins are calculated on that basis
            result = engine.run(game_stake, **kwargs)
            win_amount = result["win_amount"]

            # ─────────────────────────────
            # WALLET CREDIT (WIN)
            # ─────────────────────────────
            if win_amount > 0:
                WalletService.apply_transaction(
                    db,
                    wallet,
                    win_amount,
                    "win",
                    "bet",
                    round_obj.round_id
                )

            # ─────────────────────────────
            # FINAL UPDATES
            # ─────────────────────────────
            bet.win_amount = win_amount
            bet.bet_status = "settled"
            bet.settled_at = datetime.utcnow()

            round_obj.win_amount = win_amount
            round_obj.result_data = result["result_data"]
            round_obj.outcome = result["outcome"]
            round_obj.ended_at = datetime.utcnow()

            db.commit()

            return {
                "round_id": round_obj.round_id,
                "outcome": round_obj.outcome,
                "win_amount": win_amount,
                "balance": float(wallet.balance),
                "engine_type": game.engine_type,
                "game_data": result["result_data"], 
                "engine_config": game.engine_config or {},
                # Optional: Return split details for frontend debugging
                "bet_split": {
                    "total": bet_amount,
                    "game_stake": game_stake,
                    "jackpot_contribution": bet_amount - game_stake if opt_in else 0
                }
            }

        except Exception as e:
            db.rollback()
            raise e

    @staticmethod
    def end_session(db: Session, player_id: uuid.UUID, game_id: uuid.UUID):
        session = db.query(GameSession).filter(
            GameSession.player_id == player_id,
            GameSession.game_id == game_id,
            GameSession.status == "active"
        ).first()

        if not session:
            raise HTTPException(status_code=404, detail="Active session not found")

        session.status = "completed"
        session.ended_at = datetime.utcnow()
        db.commit()

        return {"message": "Game session ended successfully"}
