from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from uuid import UUID

from app.core.database import get_db
from app.core.security import require_tenant_admin

router = APIRouter(tags=["Tenant Stats"])

@router.get("/{tenant_id}")
def get_tenant_stats(
    tenant_id: UUID,
    db: Session = Depends(get_db),
    _=Depends(require_tenant_admin)
):
    # ⚡ For now return dummy data
    return {
        "active_games": 5,
        "total_players": 120,
        "daily_ggr": 2400,
        "live_sessions": 18
    }
