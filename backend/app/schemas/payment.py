import uuid
from pydantic import BaseModel


class DepositRequest(BaseModel):
    amount: float
    tenant_id: uuid.UUID


class WithdrawalRequest(BaseModel):
    amount: float
    tenant_id: uuid.UUID