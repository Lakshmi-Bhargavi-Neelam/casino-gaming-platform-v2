from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings
import urllib

# password = urllib.parse.quote_plus(settings.DB_PASSWORD)
 
# SQLALCHEMY_DATABASE_URL = (
#     f"postgresql+psycopg2://{settings.DB_USER}:{password}@"
#     f"{settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}?sslmode=require"
# )

engine = create_engine(
    # SQLALCHEMY_DATABASE_URL,
    # print("DATABASE URL:", SQLALCHEMY_DATABASE_URL),

    settings.database_url,
    pool_pre_ping=True

)

SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False
)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
