from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.user import User
from app.core.security import verify_password, create_access_token


class AuthService:

    @staticmethod
    def login(db: Session, email: str, password: str) -> str:
        # 1. Fetch the user
        user = db.query(User).filter(User.email == email).first()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        # 2. Verify Password
        if not verify_password(password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        # 3. Get Role Name safely
        # We assume your User model has a relationship like `role = relationship("Role")`
        # If accessing user.role triggers an error, ensure your User model has the relationship defined.
        role_name = user.role.role_name if user.role else "PLAYER"

        # 4. Create Token with Role
        token = create_access_token(
            data={
                "sub": str(user.user_id),
                "role": role_name  # <--- CRITICAL ADDITION
            }
        )

        return token