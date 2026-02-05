from pydantic import BaseModel, EmailStr, Field
from uuid import UUID
from datetime import datetime


class PlayerCreate(BaseModel):
    tenant_id: UUID
    country_code: str = Field(min_length=2, max_length=2)
    email: EmailStr
    password: str = Field(min_length=8)


class PlayerRegisterResponse(BaseModel):
    player_id: UUID
    tenant_id: UUID
    country_code: str
    email: EmailStr
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


