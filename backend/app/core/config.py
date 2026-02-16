from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Application
    project_name: str
    api_v1_str: str

    # Security
    secret_key: str
    access_token_expire_minutes: int
    algorithm: str = "HS256"   # ✅ ADD THIS

    # CORS
    backend_cors_origins: str

    # Database
    database_url: str

    # DB_USER: str
    # DB_PASSWORD: str
    # DB_HOST: str
    # DB_PORT: int
    # DB_NAME: str

    class Config:
        env_file = ".env"
        extra = "forbid"  # default in v2, explicit for clarity

settings = Settings()
