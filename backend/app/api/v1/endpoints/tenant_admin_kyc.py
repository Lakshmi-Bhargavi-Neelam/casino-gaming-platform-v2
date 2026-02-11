# app/api/v1/endpoints/tenant_admin_kyc.py

from fastapi import APIRouter, Depends, HTTPException
from app.core.security import require_tenant_admin

router = APIRouter(prefix="/tenant-admin/kyc", tags=["Tenant Admin KYC"])

# 🎯 Player KYC has been moved to Super Admin (Global Identity Model).
# Tenant Admins can no longer verify player identities.