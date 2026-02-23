from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.user import User
from app.core.security import get_password_hash

def reset_password(email, new_password):
    db: Session = SessionLocal()
    try:
        # 1. Find the user
        user = db.query(User).filter(User.email == email).first()
        
        if not user:
            print(f" Error: User with email '{email}' not found!")
            return

        # 2. Update password
        print(f"found user: {user.email} (Role ID: {user.role_id})")
        user.password_hash = get_password_hash(new_password)
        
        # 3. Commit
        db.commit()
        print(f" Password successfully updated for {email}")
        print(f"New Password: {new_password}")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    # CHANGE THIS to your exact provider email
    target_email = "player1@luckyspin.com" 
    reset_password(target_email, "player1luckyspin")