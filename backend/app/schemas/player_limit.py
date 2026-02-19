# app/schemas/player_limit.py
from pydantic import BaseModel, Field, model_validator
from datetime import datetime
from typing import Optional, Literal
from uuid import UUID
from decimal import Decimal


class PlayerLimitBase(BaseModel):
    """Base schema for player limits."""
    limit_type: Literal["DEPOSIT", "LOSS", "SESSION", "WAGER"] = Field(
        ..., description="Type of responsible gaming limit"
    )
    limit_value: float = Field(..., gt=0, description="Limit value (amount or minutes)")
    period: Literal["DAILY", "WEEKLY", "MONTHLY"] = Field(
        default="DAILY", description="Time period for the limit"
    )


class PlayerLimitCreate(PlayerLimitBase):
    """Schema for creating a new player limit."""
    pass


class PlayerLimitUpdate(BaseModel):
    """Schema for updating an existing player limit."""
    limit_value: Optional[float] = Field(None, gt=0)
    period: Optional[Literal["DAILY", "WEEKLY", "MONTHLY"]] = None


class PlayerLimitResponse(BaseModel):
    """Schema for player limit response."""
    limit_id: UUID
    player_id: UUID
    tenant_id: UUID
    limit_type: str
    limit_value: float
    period: str
    status: str
    current_usage: float
    effective_at: datetime
    requested_at: datetime
    period_start: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    # Computed fields for frontend
    remaining: Optional[float] = None
    is_pending: bool = False
    pending_increases_in: Optional[int] = None  # seconds until pending limit activates

    class Config:
        from_attributes = True


class PlayerLimitListResponse(BaseModel):
    """Schema for list of player limits."""
    limits: list[PlayerLimitResponse]
    total: int


class LimitCheckRequest(BaseModel):
    """Schema for checking if an action exceeds limits."""
    limit_type: Literal["DEPOSIT", "LOSS", "SESSION", "WAGER"]
    amount: float = Field(..., ge=0)
    tenant_id: UUID


class LimitCheckResponse(BaseModel):
    """Schema for limit check response."""
    within_limit: bool
    current_usage: float
    limit_value: float
    remaining: float
    message: Optional[str] = None
