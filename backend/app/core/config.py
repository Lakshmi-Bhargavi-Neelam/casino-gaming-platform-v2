from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Application
    project_name: str
    api_v1_str: str

    # Security
    secret_key: str
    access_token_expire_minutes: int
    algorithm: str = "HS256"   # ✅ ADD THIS

    # COR
    backend_cors_origins: str

    database_url: str


    class Config:
        env_file = ".env"
        extra = "forbid"  

settings = Settings()
