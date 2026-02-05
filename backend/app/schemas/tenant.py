from pydantic import BaseModel, Field
from typing import List, Optional
from uuid import UUID


class TenantPublic(BaseModel):
    tenant_id: UUID
    tenant_name: str
    domain: str

    class Config:
        from_attributes = True


# ---------- REQUEST ----------

class TenantCreate(BaseModel):
    tenant_name: str = Field(..., min_length=3, max_length=100)
    domain: Optional[str] = Field(None, max_length=255)
    allowed_countries: List[str] = Field(
        ..., description="List of country codes (ISO-2)"
    )

# ---------- RESPONSE ----------

class TenantResponse(BaseModel):
    tenant_id: UUID
    tenant_name: str
    domain: Optional[str]
    status: str
    allowed_countries: List[str]

    class Config:
        from_attributes = True
