from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime

class TenantAdminCreate(BaseModel):
    tenant_id: UUID
    admin_username: str
    first_name: str
    last_name: str
    password: str = Field(min_length=8)

class TenantAdminResponse(BaseModel):
    tenant_admin_id: UUID
    tenant_id: UUID
    email: str
    role: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
