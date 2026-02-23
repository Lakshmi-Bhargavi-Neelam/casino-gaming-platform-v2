from pydantic import BaseModel, Field, model_validator
from datetime import datetime
from typing import Optional, Literal
from uuid import UUID
from decimal import Decimal

class ResponsibleLimitResponse(BaseModel):
    daily_deposit_limit: Optional[float]
    daily_bet_limit: Optional[float]
    monthly_bet_limit: Optional[float]
    daily_loss_limit: Optional[float]
    session_limit_minutes: Optional[int]
    self_exclusion_until: Optional[str]
    cool_off_until: Optional[str]
    is_active: bool

    class Config:
        from_attributes = True


class ResponsibleUsageResponse(BaseModel):
    usage_date: str
    total_deposit: float
    total_bet: float
    total_loss: float

    class Config:
        from_attributes = True


class UpdateLimitsRequest(BaseModel):
    daily_deposit_limit: Optional[float] = Field(None, ge=0)
    daily_bet_limit: Optional[float] = Field(None, ge=0)
    monthly_bet_limit: Optional[float] = Field(None, ge=0)
    daily_loss_limit: Optional[float] = Field(None, ge=0)
    session_limit_minutes: Optional[int] = Field(None, ge=1)
    self_exclusion_days: Optional[int] = Field(
        None,
        ge=1,
        description="Number of days for self exclusion"
    )