from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import exists, and_
from datetime import datetime
import uuid
from app.core.security import get_db, require_tenant_admin
from app.models.user import User
from app.models.kyc_document import KYCDocument
from app.models.role import Role

router = APIRouter(prefix="/tenant-admin/kyc", tags=["Tenant Admin Player KYC"])

@router.post("/verify-player-document/{document_id}")
def tenant_admin_verify_player_doc(
    document_id: int,
    status: str = Query(..., regex="^(verified|rejected)$"),
    reason: str | None = None,
    db: Session = Depends(get_db),
    tenant_admin = Depends(require_tenant_admin)
):
    doc = db.query(KYCDocument).filter(
        KYCDocument.document_id == document_id,
        KYCDocument.is_active == True
    ).first()

    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    player = db.query(User).filter(User.user_id == doc.user_id).first()

    # 🔒 Tenant isolation
    if player.tenant_id != tenant_admin.tenant_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Update document
    doc.verification_status = status
    doc.rejection_reason = reason if status == "rejected" else None
    doc.verified_by = tenant_admin.user_id
    doc.verified_at = datetime.utcnow()

    db.flush()

    REQUIRED_DOCS = {"government_id", "proof_of_address"}

    active_docs = db.query(KYCDocument).filter(
        KYCDocument.user_id == player.user_id,
        KYCDocument.is_active == True
    ).all()

    status_map = {d.document_type: d.verification_status for d in active_docs}

    if any(status_map.get(t) == "rejected" for t in REQUIRED_DOCS):
        player.kyc_status = "rejected"
    elif any(
        t not in status_map or status_map[t] in ["pending", "submitted", "re-submitted"]
        for t in REQUIRED_DOCS
    ):
        player.kyc_status = "submitted"
    else:
        player.kyc_status = "verified"

    db.commit()
    return {"message": f"Player document {status}"}

@router.get("/pending-player-requests")
def get_pending_player_kyc_requests(
    db: Session = Depends(get_db),
    tenant_admin = Depends(require_tenant_admin)
):
    return db.query(User).join(Role).filter(
        Role.role_name == "PLAYER",
        User.tenant_id == tenant_admin.tenant_id,
        exists().where(
            and_(
                KYCDocument.user_id == User.user_id,
                KYCDocument.is_active == True,
                KYCDocument.verification_status.in_(["submitted", "re-submitted"])
            )
        )
    ).all()

@router.get("/player-documents/{player_id}")
def get_player_documents(
    player_id: uuid.UUID,
    db: Session = Depends(get_db),
    tenant_admin = Depends(require_tenant_admin)
):
    player = db.query(User).filter(
        User.user_id == player_id,
        User.tenant_id == tenant_admin.tenant_id
    ).first()

    if not player:
        raise HTTPException(404, "Player not found")

    docs = db.query(KYCDocument).filter(
        KYCDocument.user_id == player_id,
        KYCDocument.is_active == True
    ).all()

    return docs

