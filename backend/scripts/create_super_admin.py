from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

password = "SuperSecurePassword123"
hashed_password = pwd_context.hash(password)

print("Hashed password:")
print(hashed_password)
