# app/services/bonus_service.py
from datetime import datetime
from decimal import Decimal
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.bonus import Bonus
from app.models.bonus_usage import BonusUsage
from app.services.wallet_service import WalletService
from app.schemas.bonus import BonusCreate
from app.services.analytics_service import AnalyticsService


class BonusService:

    # Tenant Admin: Create Bonus

    @staticmethod
    def create_bonus(db: Session, tenant_id, payload: BonusCreate):
        bonus = Bonus(
            tenant_id=tenant_id,
            bonus_name=payload.bonus_name,
            bonus_type=payload.bonus_type,
            bonus_amount=payload.bonus_amount,
            bonus_percentage=payload.bonus_percentage,
            max_bonus_amount=payload.max_bonus_amount,
            wagering_multiplier=payload.wagering_multiplier,
            min_deposit_amount=payload.min_deposit_amount,
            valid_from=payload.valid_from,
            valid_to=payload.valid_to,
        )

        db.add(bonus)
        db.commit()
        db.refresh(bonus)
        return bonus

    # Eligibility Check

    @staticmethod
    def get_eligible_bonus(db: Session, tenant_id, player_id, deposit_amount):
        now = datetime.now()

        bonuses = db.query(Bonus).filter(
            Bonus.tenant_id == tenant_id,
            Bonus.is_active.is_(True),
            Bonus.valid_from <= now,
            Bonus.valid_to >= now
        ).all()

        for bonus in bonuses:
            usage_count = db.query(BonusUsage).filter(
                BonusUsage.bonus_id == bonus.bonus_id,
                BonusUsage.player_id == player_id
            ).count()

            if usage_count >= bonus.max_uses_per_player:
                continue

            if bonus.bonus_type == "DEPOSIT":
                if deposit_amount < bonus.min_deposit_amount:
                    continue

            return bonus

        return None

    # Grant Bonus
    @staticmethod
    def grant_bonus(
        db: Session,
        bonus: Bonus,
        player_id: UUID,
        deposit_amount: float = 0
    ):
     
        deposit_dec = Decimal(str(deposit_amount))

        if bonus.bonus_type == "DEPOSIT":
            calculated_amount = (deposit_dec * bonus.bonus_percentage) / Decimal("100")
            bonus_amount = min(calculated_amount, bonus.max_bonus_amount)
        else:
            bonus_amount = bonus.bonus_amount

        wagering_required = bonus_amount * bonus.wagering_multiplier

        bonus_wallet = WalletService.get_wallet(db, player_id, "BONUS", bonus.tenant_id)

        usage = BonusUsage(
            bonus_id=bonus.bonus_id,
            player_id=player_id,
            wallet_id=bonus_wallet.wallet_id,
            bonus_amount=bonus_amount,
            wagering_required=wagering_required,
            wagering_completed=Decimal("0.00"),
            status="active"
        )

        # ANALYTICS: Track Bonus Issued
      
        AnalyticsService.update_bonus_analytics(
            db, bonus.tenant_id, float(bonus_amount), "issued"
        )

        db.add(usage)
        db.flush() 

        # Credit BONUS wallet
        WalletService.apply_transaction(
            db=db,
            wallet=bonus_wallet,
            amount=float(bonus_amount),
            txn_code="bonus",
            ref_type="bonus",
            ref_id=bonus.bonus_id
        )

        db.commit()
        return usage
    # Apply Wagering (on every bet)
  
    @staticmethod
    def apply_wagering(db: Session, player_id, bet_amount, tenant_id: UUID):
        bet_amount = Decimal(str(bet_amount))
        now = datetime.now()


        bonuses = db.query(BonusUsage).join(
        Bonus, BonusUsage.bonus_id == Bonus.bonus_id
    ).filter(
            BonusUsage.player_id == player_id,
            BonusUsage.status == "active",
            Bonus.tenant_id == tenant_id, 
            Bonus.valid_to > now 

        ).all()

        for usage in bonuses:
            usage.wagering_completed += bet_amount

            if usage.wagering_completed >= usage.wagering_required:
                usage.status = "eligible"
    # Player-triggered Conversion

    @staticmethod
    def convert_bonus_to_cash(db: Session, bonus_usage, player_id):
        tenant_id = bonus_usage.bonus.tenant_id 
        now = datetime.now()
     
        if bonus_usage.bonus.valid_to < now:
            bonus_usage.status = "expired"
            db.commit()
            raise HTTPException(status_code=400, detail="This bonus has expired and cannot be converted.")

        if bonus_usage.status != "eligible":
            raise HTTPException(
                status_code=400,
                detail="Bonus is not eligible for conversion"
            )

        bonus_wallet = WalletService.get_wallet(db, player_id, "BONUS", tenant_id)
        cash_wallet = WalletService.get_wallet(db, player_id, "CASH", tenant_id)

        bonus_amount = bonus_usage.bonus_amount

        if bonus_wallet.balance < bonus_amount:
            raise HTTPException(
                status_code=400,
                detail="Insufficient bonus balance"
            )

        WalletService.apply_transaction(
            db=db,
            wallet=bonus_wallet,
            amount=bonus_amount,
            txn_code="bonus_conversion_debit",
            ref_type="bonus_conversion",
            ref_id=bonus_usage.bonus_usage_id
        )

        WalletService.apply_transaction(
            db=db,
            wallet=cash_wallet,
            amount=bonus_amount,
            txn_code="bonus_conversion_credit",
            ref_type="bonus_conversion",
            ref_id=bonus_usage.bonus_usage_id
        )
        # ANALYTICS: Track Bonus Converted
    
        AnalyticsService.update_bonus_analytics(
            db, tenant_id, float(bonus_amount), "converted"
        )

        bonus_usage.status = "completed"
        bonus_usage.completed_at = datetime.utcnow()

        db.commit()

        return {
            "message": "Bonus successfully converted to cash",
            "cash_balance": float(cash_wallet.balance)
        }
    # Helper Wrappers
    @staticmethod
    def get_eligible_deposit_bonus(db, tenant_id, player_id, deposit_amount):
        return BonusService.get_eligible_bonus(
            db, tenant_id, player_id, deposit_amount
        )

    @staticmethod
    def grant_deposit_bonus(db, bonus, player_id, deposit_amount):
        return BonusService.grant_bonus(
            db, bonus, player_id, deposit_amount
        )
