from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from app.core.security import require_tenant_admin
from app.core.database import get_db

from app.models.jackpot import Jackpot
from app.models.player import Player
from app.models.user import User
from app.models.jackpot_win import JackpotWin

from app.schemas.jackpot import JackpotCreate
from app.services.jackpot_service import JackpotService

router = APIRouter(prefix="/tenant/jackpots", tags=["Tenant Jackpots"])


@router.post("")
def create_jackpot(
    payload: JackpotCreate,
    user=Depends(require_tenant_admin),
    db: Session = Depends(get_db)
):
    return JackpotService.create_jackpot(db, user.tenant_id, payload)


@router.get("")
def list_my_jackpots(
    user=Depends(require_tenant_admin),
    db: Session = Depends(get_db)
):
    return db.query(Jackpot).filter(Jackpot.tenant_id == user.tenant_id).all()


@router.post("/{jackpot_id}/draw-winner")
def draw_jackpot_winner(
    jackpot_id: UUID,
    user=Depends(require_tenant_admin),
    db: Session = Depends(get_db)
):
    jackpot = db.query(Jackpot).filter(
        Jackpot.jackpot_id == jackpot_id,
        Jackpot.tenant_id == user.tenant_id
    ).first()

    if not jackpot:
        raise HTTPException(status_code=404, detail="Jackpot not found for your account")

    return JackpotService.draw_winner(db, jackpot_id)


@router.get("/wins", summary="List all jackpot payouts for this tenant")
def get_tenant_jackpot_wins(
    db: Session = Depends(get_db),
    user=Depends(require_tenant_admin)
):
    try:
        results = db.query(
            JackpotWin,
            User.email,
            Jackpot.jackpot_name
        ).join(
            Jackpot, JackpotWin.jackpot_id == Jackpot.jackpot_id
        ).join(
            User, JackpotWin.player_id == User.user_id
        ).filter(
            Jackpot.tenant_id == user.tenant_id
        ).order_by(
            JackpotWin.won_at.desc()
        ).all()

        win_logs = []

        for win, user_email, jackpot_name in results:
            win_logs.append({
                "jackpot_win_id": str(win.jackpot_win_id),
                "win_amount": float(win.win_amount),
                "won_at": win.won_at,
                "player_id": str(win.player_id),
                "user": {
                    "email": user_email
                },
                "jackpot": {
                    "jackpot_name": jackpot_name
                }
            })

        return win_logs

    except Exception as e:
        print(f"WINNER LOG ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch payout records")