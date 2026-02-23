import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.schemas.payment import DepositRequest, WithdrawalRequest

from app.core.security import get_db, get_current_user
from app.core.kyc_guard import enforce_kyc_verified

from app.models.deposit import Deposit
from app.models.withdrawal import Withdrawal

from app.services.analytics_service import AnalyticsService
from app.services.wallet_service import WalletService
from app.services.withdrawal_service import WithdrawalService
from app.services.bonus_service import BonusService
from app.services.responsible_gaming_service import ResponsibleGamingService  

router = APIRouter(prefix="/payments", tags=["Payments"])



@router.post("/deposit", summary="Player deposit (internal credit)")
def player_deposit(
    req: DepositRequest,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    enforce_kyc_verified(user)


    #  RESPONSIBLE GAMING: Check Deposit Limit
    
    limit_check = ResponsibleGamingService.check_limit(
        db=db,
        player_id=user.user_id,
        tenant_id=req.tenant_id,
        limit_type="DEPOSIT",
        amount=req.amount,
        period="DAILY"
    )
    if not limit_check.within_limit:
        raise HTTPException(
            status_code=400,
            detail=f"Deposit limit exceeded. Your daily deposit limit is ${limit_check.limit_value:.2f}. You have already deposited ${limit_check.current_usage:.2f}. Remaining: ${limit_check.remaining:.2f}"
        )

    #  Get CASH wallet
    cash_wallet = WalletService.get_wallet(db, user.user_id, "CASH", req.tenant_id)

    # Create Deposit record
    deposit = Deposit(
        player_id=user.user_id,
        tenant_id=req.tenant_id,
        wallet_id=cash_wallet.wallet_id,
        amount=req.amount,
        currency_id=cash_wallet.currency_id,
        status="success",
        completed_at=datetime.utcnow()
    )
    db.add(deposit)
    db.flush()

    # Credit CASH wallet
    WalletService.apply_transaction(
        db=db,
        wallet=cash_wallet,
        amount=req.amount,
        txn_code="deposit",
        ref_type="deposit",
        ref_id=deposit.deposit_id
    )

    
    # RESPONSIBLE GAMING: Update Deposit Usage
    ResponsibleGamingService.update_usage(
        db=db,
        player_id=user.user_id,
        tenant_id=req.tenant_id,
        limit_type="DEPOSIT",
        amount=req.amount
    )

    #  TRIGGER ANALYTICS FOR DEPOSIT
    AnalyticsService.update_financial_stats(
        db=db,
        tenant_id=req.tenant_id,
        player_id=user.user_id,
        amount=req.amount,
        type="deposit"
    )


    # BONUS CHECK 
    bonus = BonusService.get_eligible_deposit_bonus(
        db=db,
        tenant_id=req.tenant_id, 
        player_id=user.user_id,
        deposit_amount=req.amount
    )

    if bonus:
    
        BonusService.grant_deposit_bonus(
            db=db,
            bonus=bonus,
            player_id=user.user_id,
            deposit_amount=req.amount
        )

    db.commit()

    return {
        "message": "Deposit successful",
        "cash_balance": float(cash_wallet.balance),
        "bonus_granted": bool(bonus)
    }


@router.get("/admin/withdrawals/pending", summary="Get all pending withdrawal requests")
def get_pending_withdrawals(
    db: Session = Depends(get_db),
   
    user = Depends(get_current_user) 
):
  
    withdrawals = db.query(Withdrawal).filter(
        Withdrawal.status == "requested",
        Withdrawal.tenant_id == user.tenant_id
    ).order_by(Withdrawal.requested_at.desc()).all()

    return [
        {
            "id": str(w.withdrawal_id),
            "player_id": str(w.player_id),
            "amount": float(w.amount),
            "status": w.status,
            "created_at": w.requested_at,
        } for w in withdrawals
    ]

@router.post("/withdraw")
def request_withdrawal(req: WithdrawalRequest, db: Session = Depends(get_db), user = Depends(get_current_user)):
    enforce_kyc_verified(user)
    WithdrawalService.create_request(db, user.user_id, req.tenant_id, req.amount)
    db.commit()
    return {"message": "Withdrawal request submitted. Funds have been locked for review."}

@router.post("/admin/withdrawals/{withdrawal_id}/approve", summary="Admin approves withdrawal")
def approve_withdrawal(
    withdrawal_id: uuid.UUID,
    db: Session = Depends(get_db),
    user = Depends(get_current_user) 
):
    enforce_kyc_verified(user)
    withdrawal = WithdrawalService.approve_withdrawal(db, withdrawal_id)

    #TRIGGER ANALYTICS FOR WITHDRAWAL
    try:
        AnalyticsService.update_financial_stats(
            db=db,
            tenant_id=user.tenant_id, 
            player_id=withdrawal.player_id,
            amount=float(withdrawal.amount),
            type="withdrawal"
        )
    except Exception as e:
        print(f"Withdrawal Analytics Error: {e}")

    db.commit()
    
    return {"message": "Withdrawal approved and wallet updated successfully"}

@router.post("/admin/withdrawals/{withdrawal_id}/reject")
def reject_withdrawal(withdrawal_id: uuid.UUID, db: Session = Depends(get_db)):
    WithdrawalService.reject_withdrawal(db, withdrawal_id)
    db.commit()
    return {"message": "Withdrawal rejected and funds refunded"}
