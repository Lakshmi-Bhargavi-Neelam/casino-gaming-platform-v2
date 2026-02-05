from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import uuid
from app.schemas.tenant_admin import TenantAdminCreate
from app.services.tenant_admin_service import TenantAdminService
from app.core.database import get_db
from app.core.security import require_super_admin, get_current_user

# app/api/v1/endpoints/tenant_admins.py
from app.models.player import Player
from app.models.user import User
from app.models.country import Country
from app.models.wallet import Wallet

router = APIRouter(
    tags=["Tenant Admins"]
)


@router.post("")
def create_tenant_admin(
    payload: TenantAdminCreate,
    db: Session = Depends(get_db),
    _=Depends(require_super_admin),
):
    return TenantAdminService.create_tenant_admin(db, payload)


# app/api/v1/endpoints/tenant_admins.py

# app/api/v1/endpoints/tenant_admins.py

@router.get("/admin/players/list")
def get_tenant_players(db: Session = Depends(get_db), user = Depends(get_current_user)):
    # 🎯 FIX: Filter the outer join to only include the 'CASH' wallet
    # This prevents the same player from appearing multiple times
    results = db.query(
        Player, User, Country, Wallet
    ).join(User, Player.player_id == User.user_id)\
     .join(Country, User.country_code == Country.country_code)\
     .outerjoin(Wallet, (Player.player_id == Wallet.player_id) & (Wallet.wallet_type_id == 1))\
     .filter(User.tenant_id == user.tenant_id).all()
    
    return [
        {
            "player_id": str(p.player_id),
            "player_name": f"{u.first_name} {u.last_name}" if (u.first_name and u.last_name) else u.email.split('@')[0],
            "email": u.email,
            "country": c.country_name,
            "status": p.status, 
            
            "last_login": p.last_login_at.strftime("%Y-%m-%d %H:%M") if p.last_login_at else "Never",
            "balance": float(w.balance) if w else 0.0,
            "joined_at": p.created_at.strftime("%Y-%m-%d") if p.created_at else "Unknown"
        } for p, u, c, w in results
    ]
@router.post("/admin/players/{player_id}/status")
def update_player_status(player_id: uuid.UUID, status_update: dict, db: Session = Depends(get_db)):
    # 🎯 Update status in the Players table
    player = db.query(Player).filter(Player.player_id == player_id).first()
    if not player:
        raise HTTPException(404, "Player not found")
    
    new_status = status_update.get("status")
    if new_status not in ['active', 'suspended', 'self_excluded', 'closed']:
        raise HTTPException(400, "Invalid status")

    player.status = new_status
    db.commit()
    return {"message": f"Player status updated to {new_status}"}
