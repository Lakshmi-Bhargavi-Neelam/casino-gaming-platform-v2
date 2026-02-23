import uuid
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException
from app.services.analytics_service import AnalyticsService

from app.models.game import Game
from app.models.game_round import GameRound
from app.models.bet import Bet
from app.models.player_stats_summary import PlayerStatsSummary
from app.models.tenant_game import TenantGame
from app.models.game_session import GameSession
from app.game_engines.slot_engine import SlotEngine
from app.services.wallet_service import WalletService
from app.game_engines.dice_engine import DiceEngine # Ensure this is imported
from app.game_engines.mines_engine import MinesEngine
from app.services.bonus_service import BonusService # 🎯 1. IMPORT BONUS SERVICE
from app.services.jackpot_service import JackpotService # 🎯 Import this
from app.game_engines.crash_engine import CrashEngine
from app.services.responsible_gaming_service import ResponsibleGamingService  # Responsible Gaming 



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
        opt_in: bool = False,
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

            # 🎯 FIX: Pass tenant_id to find the specific casino wallet
            wallet = WalletService.get_wallet(db, player_id, "CASH", tenant_id)
            
            engine = GameplayService.get_engine(game)

            engine.validate_bet(
                bet_amount,
                tenant_game.min_bet or game.min_bet,
                tenant_game.max_bet or game.max_bet
            )

            # ─────────────────────────────
            # 🎯 RESPONSIBLE GAMING: Check WAGER Limit
            # ─────────────────────────────
            wager_check = ResponsibleGamingService.check_limit(
                db=db,
                player_id=player_id,
                tenant_id=tenant_id,
                limit_type="WAGER",
                amount=bet_amount,
                period="DAILY"
            )
            if not wager_check.within_limit:
                raise HTTPException(
                    status_code=400,
                    detail=f"Wager limit exceeded. Your daily wager limit is ${wager_check.limit_value:.2f}. You have already wagered ${wager_check.current_usage:.2f}. Remaining: ${wager_check.remaining:.2f}"
                )

            # ─────────────────────────────
            # 🎯 RESPONSIBLE GAMING: Check LOSS Limit (before bet)
            # ─────────────────────────────
            # Check if this bet could result in exceeding loss limit
            # (worst case: player loses the entire bet)
            loss_check = ResponsibleGamingService.check_limit(
                db=db,
                player_id=player_id,
                tenant_id=tenant_id,
                limit_type="LOSS",
                amount=bet_amount,  # Max possible loss = bet amount
                period="DAILY"
            )
            if not loss_check.within_limit:
                raise HTTPException(
                    status_code=400,
                    detail=f"Loss limit exceeded. Your daily loss limit is ${loss_check.limit_value:.2f}. You have already lost ${loss_check.current_usage:.2f}. Remaining: ${loss_check.remaining:.2f}"
                )

            # ─────────────────────────────
            # SESSION CREATION & LIMIT CHECK
            # ─────────────────────────────

            session = db.query(GameSession).filter(
                GameSession.player_id == player_id,
                GameSession.game_id == game_id,
                GameSession.status == "active"
            ).first()

            # ─────────────────────────────
            # 🎯 RESPONSIBLE GAMING: Check SESSION Limit (PER GAME)
            # ─────────────────────────────
            session_limit = ResponsibleGamingService.get_limit_by_type(
                db=db,
                player_id=player_id,
                tenant_id=tenant_id,
                limit_type="SESSION",
                period="DAILY"
            )

            if session_limit:
                max_minutes = float(session_limit.limit_value)
                current_daily_minutes = float(session_limit.current_usage or 0)
                current_session_minutes = 0

                if session:
                    # EXISTING SESSION: Calculate current session time
                    session_start = session.started_at
                    if session_start:
                        if isinstance(session_start, str):
                            from dateutil import parser
                            session_start = parser.parse(session_start)
                        current_session_minutes = (datetime.now() - session_start).total_seconds() / 60.0

                    # Total time = daily usage from completed sessions + current ongoing session
                    total_session_minutes = current_daily_minutes + current_session_minutes

                    if total_session_minutes >= max_minutes:
                        # Auto-end this session and block the bet
                        session.status = "completed"
                        session.ended_at = datetime.now()
                        db.commit()
                        raise HTTPException(
                            status_code=400,
                            detail=f"Session limit exceeded for this game. Your daily session limit is {max_minutes:.0f} minutes. You have used {total_session_minutes:.1f} minutes. This game session has been automatically ended."
                        )
                else:
                    # NEW SESSION: Check if player has remaining session time
                    if current_daily_minutes >= max_minutes:
                        raise HTTPException(
                            status_code=400,
                            detail=f"Session limit exceeded. Your daily session limit is {max_minutes:.0f} minutes. You have already used {current_daily_minutes:.0f} minutes."
                        )

            if not session:
                session = GameSession(
                    player_id=player_id,
                    game_id=game_id,
                    tenant_id=tenant_id,
                    status="active",
                    started_at=datetime.now()

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
            game_stake = bet_amount 
            
            if opt_in:
                from app.services.jackpot_service import JackpotService
                # This helper already accepts tenant_id to find the right pool
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
            WalletService.apply_transaction(
                db,
                wallet,
                bet_amount,
                "bet",
                "bet",
                round_obj.round_id
            )
            # RESPONSIBLE GAMING: Update WAGER Usage
         
            ResponsibleGamingService.update_usage(
                db=db,
                player_id=player_id,
                tenant_id=tenant_id,
                limit_type="WAGER",
                amount=bet_amount,
                period="DAILY"
            )
            # BONUS WAGERING (GAME STAKE)
          
            BonusService.apply_wagering(
                db, 
                player_id=player_id, 
                bet_amount=game_stake, 
                tenant_id=tenant_id 
            )
            # GAME ENGINE EXECUTION (GAME STAKE)
            
            result = engine.run(game_stake, **kwargs)
            win_amount = result["win_amount"]

            # RESPONSIBLE GAMING: Check & Update LOSS Limit
        
            net_loss = bet_amount - win_amount 
            if net_loss > 0:
                loss_check = ResponsibleGamingService.check_limit(
                    db=db,
                    player_id=player_id,
                    tenant_id=tenant_id,
                    limit_type="LOSS",
                    amount=net_loss,
                    period="DAILY"
                )
                if not loss_check.within_limit:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Loss limit exceeded. Your daily loss limit is ${loss_check.limit_value:.2f}."
                    )
                # Update loss usage
                ResponsibleGamingService.update_usage(
                    db=db,
                    player_id=player_id,
                    tenant_id=tenant_id,
                    limit_type="LOSS",
                    amount=net_loss,
                    period="DAILY"
                )

            # WALLET CREDIT (WIN)
            if win_amount > 0:
                WalletService.apply_transaction(
                    db,
                    wallet,
                    win_amount,
                    "win",
                    "bet",
                    round_obj.round_id
                )
            # FINAL UPDATES
            bet.win_amount = win_amount
            bet.bet_status = "settled"
            bet.settled_at = datetime.utcnow()

            round_obj.win_amount = win_amount
            round_obj.result_data = result["result_data"]
            round_obj.outcome = result["outcome"]
            round_obj.ended_at = datetime.utcnow()

           

             #Trigger Live Analytics
            try:
                AnalyticsService.update_bet_stats(
                    db=db,
                    tenant_id=tenant_id,
                    player_id=player_id,
                    game_id=game_id,
                    provider_id=game.provider_id, 
                    bet_amount=bet_amount,
                    win_amount=win_amount
                )
                db.commit()
            except Exception as e:
                print(f"Analytics logging failed: {e}") 

            return {
                "round_id": round_obj.round_id,
                "outcome": round_obj.outcome,
                "win_amount": win_amount,
                "balance": float(wallet.balance),
                "engine_type": game.engine_type,
                "game_data": result["result_data"], 
                "engine_config": game.engine_config or {},
                "bet_split": {
                    "total": bet_amount,
                    "game_stake": game_stake,
                    "jackpot_contribution": round(bet_amount - game_stake, 2) if opt_in else 0
                }
            }

        except Exception as e:
            db.rollback()
            raise e

    @staticmethod
    def end_session(db: Session, player_id: uuid.UUID, game_id: uuid.UUID, tenant_id: uuid.UUID):
        session = db.query(GameSession).filter(
            GameSession.player_id == player_id,
            GameSession.game_id == game_id,
            GameSession.tenant_id == tenant_id,
            GameSession.status == "active"
        ).first()

        if not session:
            raise HTTPException(status_code=404, detail="Active session not found in this casino")

        now = datetime.now()

    
        start_time = session.started_at
        if start_time is None:
           start_time = now
        if isinstance(start_time, str):
            from dateutil import parser
            start_time = parser.parse(start_time)
            
      
        duration = int((now - start_time).total_seconds())

        duration_minutes = duration / 60.0 
        if duration_minutes > 0:
            ResponsibleGamingService.update_usage(
                db=db,
                player_id=player_id,
                tenant_id=tenant_id,
                limit_type="SESSION",
                amount=duration_minutes,
                period="DAILY"
            )

        session.status = "completed"
        session.ended_at = now
        
        # Update Player Stats
        stats = db.query(PlayerStatsSummary).filter(
            PlayerStatsSummary.player_id == player_id
        ).first()

        if stats:
            stats.total_play_time_seconds = (stats.total_play_time_seconds or 0) + duration
            stats.updated_at = now

        db.commit()
        return {"message": "Game session ended successfully"}