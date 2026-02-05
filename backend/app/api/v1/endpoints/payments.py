import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.security import get_db, get_current_user
from app.services.wallet_service import WalletService
from app.services.withdrawal_service import WithdrawalService
from app.models.deposit import Deposit
from app.models.withdrawal import Withdrawal

router = APIRouter(prefix="/payments", tags=["Payments"])

# -----------------------------
# Request Schemas
# -----------------------------

class DepositRequest(BaseModel):
    amount: float

class WithdrawalRequest(BaseModel):
    amount: float


# 💳 PLAYER DEPOSIT (Internal Credit)
@router.post("/deposit", summary="Player deposit (internal credit)")
def player_deposit(
    req: DepositRequest,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    wallet = WalletService.get_wallet(db, user.user_id, "CASH")

    deposit = Deposit(
        player_id=user.user_id,
        tenant_id=user.tenant_id,
        wallet_id=wallet.wallet_id,
        amount=req.amount,
        currency_id=wallet.currency_id,
        status="success",
        completed_at=datetime.utcnow()
    )
    db.add(deposit)
    db.flush()

    WalletService.apply_transaction(
        db=db,
        wallet=wallet,
        amount=req.amount,
        txn_code="deposit",
        ref_type="deposit",
        ref_id=deposit.deposit_id
    )

    db.commit()
    return {"message": "Deposit successful", "balance": wallet.balance}


# ➖ PLAYER WITHDRAWAL REQUEST

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
    WithdrawalService.create_request(db, user.user_id, user.tenant_id, req.amount)
    db.commit()
    return {"message": "Withdrawal request submitted. Funds have been locked for review."}

# app/api/v1/endpoints/payments.py

@router.post("/admin/withdrawals/{withdrawal_id}/approve", summary="Admin approves withdrawal")
def approve_withdrawal(
    withdrawal_id: uuid.UUID,
    db: Session = Depends(get_db),
    user = Depends(get_current_user) # Ensure only authorized users can approve
):
    # 🎯 Call the centralized service to handle status and wallet updates
    withdrawal = WithdrawalService.approve_withdrawal(db, withdrawal_id)
    
    # IMPORTANT: Commit the changes to the database
    db.commit()
    
    return {"message": "Withdrawal approved and wallet updated successfully"}

@router.post("/admin/withdrawals/{withdrawal_id}/reject")
def reject_withdrawal(withdrawal_id: uuid.UUID, db: Session = Depends(get_db)):
    WithdrawalService.reject_withdrawal(db, withdrawal_id)
    db.commit()
    return {"message": "Withdrawal rejected and funds refunded"}
