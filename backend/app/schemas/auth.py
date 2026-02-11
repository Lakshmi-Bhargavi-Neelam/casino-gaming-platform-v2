from pydantic import BaseModel, EmailStr
from uuid import UUID
from typing import Optional, List

class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    # Optional: Sent as NULL in Step 1, Sent as UUID in Step 2
    tenant_id: Optional[UUID] = None 

# 🎯 New: Model for the tenant selection list in Step 2
class TenantOption(BaseModel):
    tenant_id: UUID
    tenant_name: str
    domain: Optional[str] = None

# 🎯 New: Combined response to handle both scenarios
class LoginResponse(BaseModel):
    # --- Case 1: Successful Login ---
    access_token: Optional[str] = None
    token_type: Optional[str] = "bearer"
    
    # --- Case 2: Multi-Tenant Selection Required ---
    require_tenant_selection: bool = False
    tenants: Optional[List[TenantOption]] = None

    class Config:
        from_attributes = True