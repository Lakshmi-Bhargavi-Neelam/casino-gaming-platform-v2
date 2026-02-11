# app/api/v1/endpoints/super_admin_kyc.py

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import exists, and_
import uuid
from datetime import datetime

from app.core.security import get_db, require_super_admin
from app.models.user import User
from app.models.kyc_document import KYCDocument
from app.models.role import Role
from app.services.kyc_engine import recalculate_user_kyc_status

router = APIRouter(prefix="/admin/kyc", tags=["Super Admin KYC"])


@router.get("/pending-requests")
def get_business_pending_requests(
    role_name: str = Query(..., regex="^(tenant_admin|game_provider|player)$"),
    db: Session = Depends(get_db),
    admin=Depends(require_super_admin)
):
    """Fetch Tenant Admins or Game Providers who have docs needing review."""
    role_name = role_name.upper()

    return db.query(User).join(Role).filter(
        Role.role_name == role_name,
        exists().where(
            and_(
                KYCDocument.user_id == User.user_id,
                KYCDocument.is_active == True,
                KYCDocument.verification_status.in_(["submitted", "re-submitted"])
            )
        )
    ).all()


@router.post("/verify-document/{document_id}")
def super_admin_verify(
    document_id: int,
    status: str = Query(..., regex="^(verified|rejected)$"),
    reason: str | None = None,
    db: Session = Depends(get_db),
    admin=Depends(require_super_admin)
):
    # Fetch document
    doc = db.query(KYCDocument).filter(
        KYCDocument.document_id == document_id,
        KYCDocument.is_active == True
    ).first()

    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    # Update document
    doc.verification_status = status
    doc.rejection_reason = reason if status == "rejected" else None
    doc.verified_by = admin.user_id
    doc.verified_at = datetime.utcnow()

    db.flush()

    # Recalculate global user KYC status
    user = db.query(User).filter(User.user_id == doc.user_id).first()
    recalculate_user_kyc_status(user, db)

    db.commit()
    return {"message": f"Document {status} successfully"}


@router.get("/user-documents/{user_id}")
def get_user_documents(
    user_id: uuid.UUID,
    db: Session = Depends(get_db),
    admin=Depends(require_super_admin)
):
    docs = db.query(KYCDocument).filter(
        KYCDocument.user_id == user_id
    ).all()

    return [
    {
        "document_id": doc.document_id,
        "document_type": doc.document_type,
        "status": doc.verification_status,
        "uploaded_at": doc.uploaded_at.isoformat() if doc.uploaded_at else None,
        "file_url": f"http://localhost:8080/static/{doc.file_path}",
        "rejection_reason": doc.rejection_reason,   # ✅ ADD
        "version": doc.version                     # ✅ ADD
    }
    for doc in docs
]

