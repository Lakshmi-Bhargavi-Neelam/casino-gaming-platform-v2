from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

class BonusUsageResponse(BaseModel):
    bonus_usage_id: UUID
    bonus_id: UUID
    bonus_amount: float
    wagering_required: float
    wagering_completed: float
    status: str
    created_at: datetime

    class Config:
        orm_mode = True
