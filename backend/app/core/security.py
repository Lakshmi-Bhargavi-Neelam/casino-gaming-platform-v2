from datetime import datetime, timedelta
from jose import jwt, JWTError
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from passlib.context import CryptContext

from app.core.database import get_db
from app.core.config import settings
from app.models.user import User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# ─────────────────────────────
# Password helpers
# ─────────────────────────────
def get_password_hash(password: str) -> str:
    if len(password.encode("utf-8")) > 72:
        password = password.encode("utf-8")[:72].decode("utf-8", errors="ignore")
    return pwd_context.hash(password)

def verify_password(password: str, hashed: str) -> bool:
    return pwd_context.verify(password, hashed)

# ─────────────────────────────
# JWT helpers
# ─────────────────────────────
def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        user_id: str | None = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")

    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user

# ─────────────────────────────
# Role-Based Access Control (RBAC)
# ─────────────────────────────

def require_super_admin(current_user: User = Depends(get_current_user)):
    """ Allows access only to SUPER_ADMIN """
    if not current_user.role or current_user.role.role_name != "SUPER_ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="SUPER_ADMIN privileges required"
        )
    return current_user

def require_tenant_admin(current_user: User = Depends(get_current_user)):
    """ Allows access only to TENANT_ADMIN """
    if not current_user.role or current_user.role.role_name != "TENANT_ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="TENANT_ADMIN privileges required"
        )
    return current_user

def require_any_admin(current_user: User = Depends(get_current_user)):
    """ Allows access to either SUPER_ADMIN or TENANT_ADMIN """
    if not current_user.role or current_user.role.role_name not in ["SUPER_ADMIN", "TENANT_ADMIN"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    return current_user

def get_current_player(current_user: User = Depends(get_current_user)):
    """ Allows access only to PLAYER users """
    if not current_user.role or current_user.role.role_name != "PLAYER":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="PLAYER privileges required"
        )
    return current_user
