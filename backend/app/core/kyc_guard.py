from fastapi import HTTPException
from app.models.user import User

def enforce_kyc_verified(user: User):
    """
    Dependency/Guard to ensure the user is KYC verified.
    Raises 403 HTTPException if not verified.
    """
    if user.kyc_status != "verified":
        raise HTTPException(
            status_code=403,
            detail={
                "error": "KYC_REQUIRED",
                "message": "KYC verification is required to perform this action.",
                "current_status": user.kyc_status
            }
        )
