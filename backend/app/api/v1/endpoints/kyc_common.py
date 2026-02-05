# app/api/v1/endpoints/kyc_common.py

import os
import shutil
from fastapi import APIRouter, Depends, HTTPException, Form, File, UploadFile
from sqlalchemy.orm import Session

from app.core.security import get_db, get_current_user
from app.models.user import User
from app.models.kyc_document import KYCDocument
from app.models.role import Role
from app.services.kyc_engine import recalculate_user_kyc_status, ROLE_REQUIREMENTS


router = APIRouter(tags=["KYC Common"])


@router.post("/submit-document")
async def submit_document(
    document_type: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    upload_dir = os.path.join(os.getcwd(), "uploads", "kyc")
    os.makedirs(upload_dir, exist_ok=True)

    filename = f"{user.user_id}_{file.filename}"
    file_location = os.path.join(upload_dir, filename)
    db_path = f"uploads/kyc/{filename}"

    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # 🔎 Version handling
    previous_docs = db.query(KYCDocument).filter(
        KYCDocument.user_id == user.user_id,
        KYCDocument.document_type == document_type
    ).all()

    version = len(previous_docs) + 1
    status = "submitted" if version == 1 else "re-submitted"

    # Deactivate old active doc
    db.query(KYCDocument).filter(
        KYCDocument.user_id == user.user_id,
        KYCDocument.document_type == document_type,
        KYCDocument.is_active == True
    ).update({"is_active": False})

    # Insert new doc
    db.add(KYCDocument(
        user_id=user.user_id,
        document_type=document_type,
        file_path=db_path,
        verification_status=status,
        version=version,
        is_active=True
    ))

    # 🔄 Recalculate global status
    user_obj = db.query(User).filter(User.user_id == user.user_id).first()
    recalculate_user_kyc_status(user_obj, db)

    db.commit()
    return {"message": "File uploaded successfully"}



@router.get("/my-status")
def get_my_kyc_status(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    documents = db.query(KYCDocument).filter(
        KYCDocument.user_id == user.user_id,
        KYCDocument.is_active == True  # 👈 Only current version
    ).all()

    return {
        "user_status": user.kyc_status,
        "global_reason": user.kyc_rejection_reason,
        "documents": [
            {
                "id": doc.document_id,
                "type": doc.document_type,
                "status": doc.verification_status,
                "rejection_reason": doc.rejection_reason
            }
            for doc in documents
        ]
    }
