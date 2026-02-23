from fastapi import APIRouter, Depends, HTTPException
from app.core.security import require_tenant_admin

router = APIRouter(prefix="/tenant-admin/kyc", tags=["Tenant Admin KYC"])
