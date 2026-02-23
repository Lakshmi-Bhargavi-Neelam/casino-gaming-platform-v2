from app.models.kyc_document import KYCDocument

ROLE_REQUIREMENTS = {
    "TENANT_ADMIN": {"business_license", "identity_proof"},
    "GAME_PROVIDER": {"corporate_registration", "gaming_license", "rng_certificate"},
    "PLAYER": {"government_id", "proof_of_address"},
}


def recalculate_user_kyc_status(user, db):
    required_docs = ROLE_REQUIREMENTS.get(user.role.role_name, set())

    active_docs = db.query(KYCDocument).filter(
        KYCDocument.user_id == user.user_id,
        KYCDocument.is_active == True
    ).all()

    status_map = {d.document_type: d.verification_status for d in active_docs}


    if any(status_map.get(doc) == "rejected" for doc in required_docs):
        user.kyc_status = "rejected"
        user.kyc_rejection_reason = "One or more documents were rejected. Please re-upload."
        return

    if any(doc not in status_map for doc in required_docs):
        user.kyc_status = "pending"
        user.kyc_rejection_reason = None
        return

 
    if any(status_map[doc] in ["submitted", "re-submitted"] for doc in required_docs):
        user.kyc_status = "submitted"
        user.kyc_rejection_reason = None
        return

    
    if all(status_map[doc] == "verified" for doc in required_docs):
        user.kyc_status = "verified"
        user.kyc_rejection_reason = None
    else:
      
        user.kyc_status = "submitted"
