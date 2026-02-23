from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import Optional
from uuid import UUID

from app.models.user import User
from app.core.security import verify_password, create_access_token

class AuthService:
    @staticmethod
    def login(db: Session, email: str, password: str) -> dict:
        
        user = db.query(User).filter(User.email == email).first()

        if not user or not verify_password(password, user.password_hash):
            raise HTTPException(401, "Invalid email or password")

        role_name = user.role.role_name if user.role else "PLAYER"
        
        token = create_access_token(data={
            "sub": str(user.user_id),
            "role": role_name,
            "country_code": user.country_code
        })

        return {"access_token": token}