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

    # 1️⃣ REJECTED: High priority
    # If ANY active document is rejected, the user status is rejected.
    if any(status_map.get(doc) == "rejected" for doc in required_docs):
        user.kyc_status = "rejected"
        user.kyc_rejection_reason = "One or more documents were rejected. Please re-upload."
        return

    # 2️⃣ PENDING
    # If any required document is MISSING (not in status_map), user is pending.
    if any(doc not in status_map for doc in required_docs):
        user.kyc_status = "pending"
        user.kyc_rejection_reason = None
        return

    # 3️⃣ SUBMITTED
    # All docs exist (passed step 2). None are rejected (passed step 1).
    # If ANY doc is submitted/re-submitted, user is submitted.
    # Note: "verified" docs are fine here, heavily implies "at least one is NOT verified"
    # because if ALL were verified, we'd fall through to step 4.
    if any(status_map[doc] in ["submitted", "re-submitted"] for doc in required_docs):
        user.kyc_status = "submitted"
        user.kyc_rejection_reason = None
        return

    # 4️⃣ VERIFIED
    # All docs exist, none rejected, none submitted/re-submitted.
    # Implicitly means all must be verified.
    # Double check for safety:
    if all(status_map[doc] == "verified" for doc in required_docs):
        user.kyc_status = "verified"
        user.kyc_rejection_reason = None
    else:
        # Fallback (should theoretically not happen if logic is sound)
        user.kyc_status = "submitted"
