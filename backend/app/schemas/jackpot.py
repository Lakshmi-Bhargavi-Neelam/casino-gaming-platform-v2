from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, Literal
from uuid import UUID

class JackpotCreate(BaseModel):
    jackpot_name: str = Field(..., min_length=3, max_length=100)
    
    # 🎯 FIX 1: Add PROGRESSIVE to the Literal list
    jackpot_type: Literal["FIXED", "SPONSORED", "PROGRESSIVE"] 
    
    currency_id: int
    seed_amount: float = Field(..., ge=0)
    
    # Required for FIXED
    reset_cycle: Optional[Literal["DAILY", "WEEKLY", "MONTHLY", "NEVER"]] = "NEVER"
    
    # Required for SPONSORED
    deadline: Optional[datetime] = None

    # 🎯 FIX 2: Add these fields for PROGRESSIVE
    contribution_percentage: Optional[float] = Field(0, ge=0)
    opt_in_required: Optional[bool] = False

class JackpotContribution(BaseModel):
    amount: float = Field(..., gt=0)