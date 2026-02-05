from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.schemas.auth import LoginRequest, TokenResponse
from app.services.auth_service import AuthService
from app.core.database import get_db

router = APIRouter(tags=["Auth"])


@router.post("/login", response_model=TokenResponse)
def login(
    payload: LoginRequest,
    db: Session = Depends(get_db),
):
    token = AuthService.login(db, payload.email, payload.password)

    return TokenResponse(access_token=token)
