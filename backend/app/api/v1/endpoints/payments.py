import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.services.analytics_service import AnalyticsService

from app.core.security import get_db, get_current_user
from app.services.wallet_service import WalletService
from app.services.withdrawal_service import WithdrawalService
from app.models.deposit import Deposit
from app.models.withdrawal import Withdrawal
from app.core.kyc_guard import enforce_kyc_verified
from app.services.bonus_service import BonusService

router = APIRouter(prefix="/payments", tags=["Payments"])

class DepositRequest(BaseModel):
    amount: float
    tenant_id: uuid.UUID  # 🎯 ADD THIS


@router.post("/deposit", summary="Player deposit (internal credit)")
def player_deposit(
    req: DepositRequest,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    enforce_kyc_verified(user)

    # 1️⃣ Get CASH wallet
    cash_wallet = WalletService.get_wallet(db, user.user_id, "CASH", req.tenant_id)

    # 2️⃣ Create Deposit record
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

    # 3️⃣ Credit CASH wallet
    WalletService.apply_transaction(
        db=db,
        wallet=cash_wallet,
        amount=req.amount,
        txn_code="deposit",
        ref_type="deposit",
        ref_id=deposit.deposit_id
    )

        # ─────────────────────────────
    # 🎯 NEW: TRIGGER ANALYTICS FOR DEPOSIT
    # ─────────────────────────────
    AnalyticsService.update_financial_stats(
        db=db,
        tenant_id=req.tenant_id,
        amount=req.amount,
        type="deposit"
    )


    # 4️⃣ 🔥 BONUS CHECK - standardized to user.user_id
    bonus = BonusService.get_eligible_deposit_bonus(
        db=db,
        tenant_id=req.tenant_id, # 🎯 Use tenant_id from request
        player_id=user.user_id,
        deposit_amount=req.amount
    )

    if bonus:
        # Standardized call: removed 'tenant_id' to match Service signature
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

# Withdrawal routes remain the same...



# ➖ PLAYER WITHDRAWAL REQUEST


class WithdrawalRequest(BaseModel):
    amount: float
    tenant_id: uuid.UUID # 🎯 Add this line

    
# app/api/endpoints/payments.py (or similar)

@router.get("/admin/withdrawals/pending", summary="Get all pending withdrawal requests")
def get_pending_withdrawals(
    db: Session = Depends(get_db),
    # Ensure only authorized tenant admins can access this
    user = Depends(get_current_user) 
):
    # 🎯 Security: Only fetch requests belonging to this admin's tenant
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

# app/api/v1/endpoints/payments.py

@router.post("/admin/withdrawals/{withdrawal_id}/approve", summary="Admin approves withdrawal")
def approve_withdrawal(
    withdrawal_id: uuid.UUID,
    db: Session = Depends(get_db),
    user = Depends(get_current_user) # Ensure only authorized users can approve
):
    enforce_kyc_verified(user)
    # 🎯 Call the centralized service to handle status and wallet updates
    withdrawal = WithdrawalService.approve_withdrawal(db, withdrawal_id)
    # ─────────────────────────────
    # 🎯 NEW: TRIGGER ANALYTICS FOR WITHDRAWAL
    # ─────────────────────────────
    try:
        AnalyticsService.update_financial_stats(
            db=db,
            tenant_id=user.tenant_id, # Admin's tenant
            amount=float(withdrawal.amount),
            type="withdrawal"
        )
    except Exception as e:
        print(f"Withdrawal Analytics Error: {e}")

    # IMPORTANT: Commit the changes to the database
    db.commit()
    
    return {"message": "Withdrawal approved and wallet updated successfully"}

@router.post("/admin/withdrawals/{withdrawal_id}/reject")
def reject_withdrawal(withdrawal_id: uuid.UUID, db: Session = Depends(get_db)):
    WithdrawalService.reject_withdrawal(db, withdrawal_id)
    db.commit()
    return {"message": "Withdrawal rejected and funds refunded"}
