from pydantic import BaseModel, EmailStr, Field


class GameProviderCreate(BaseModel):
    provider_name: str
    website: str | None
    email: EmailStr
    password: str = Field(min_length=8)
