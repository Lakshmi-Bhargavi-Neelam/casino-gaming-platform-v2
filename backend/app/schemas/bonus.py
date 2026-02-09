# app/schemas/bonus.py
from pydantic import BaseModel, Field, model_validator
from datetime import datetime
from typing import Optional, Literal


class BonusCreate(BaseModel):
    bonus_name: str = Field(..., min_length=3, max_length=100)

    bonus_type: Literal["DEPOSIT", "FIXED_CREDIT"] # 🎯 Update this

    # 🎯 Changed gt=0 to ge=0 to prevent 422 errors when frontend sends 0 for unused fields
    bonus_percentage: Optional[float] = Field(0, ge=0, le=100)
    max_bonus_amount: Optional[float] = Field(0, ge=0)
    min_deposit_amount: Optional[float] = Field(0, ge=0)

    # NO_DEPOSIT bonus fields
    bonus_amount: Optional[float] = Field(0, ge=0)

    # 🎯 Changed ge=1 to ge=0 to allow "Real Cash" bonuses with no wagering
    wagering_multiplier: int = Field(default=30, ge=0)

    valid_from: datetime
    valid_to: datetime

    max_uses_per_player: int = Field(default=1, ge=1)
    is_active: bool = True

    # -------------------------
    # Cross-field validation (Pydantic v2 style)
    # -------------------------
    @model_validator(mode="after")
    def validate_bonus_type_rules(self):
        if self.valid_from >= self.valid_to:
            raise ValueError("Expiration date must be after Activation date")

        if self.bonus_type == "DEPOSIT":
            # Ensure the percentage logic is actually provided
            if not self.bonus_percentage or self.bonus_percentage <= 0:
                raise ValueError("Match percentage must be greater than 0 for DEPOSIT bonuses")
            
            if self.max_bonus_amount is None or self.max_bonus_amount <= 0:
                raise ValueError("Max bonus amount must be greater than 0 for DEPOSIT bonuses")
            
            # Reset fixed amount if it was sent by mistake
            self.bonus_amount = 0

        if self.bonus_type == "NO_DEPOSIT":
            # Ensure the fixed credit is actually provided
            if not self.bonus_amount or self.bonus_amount <= 0:
                raise ValueError("Fixed bonus amount must be greater than 0 for NO_DEPOSIT bonuses")
            
            # Reset deposit-only fields to 0
            self.bonus_percentage = 0
            self.max_bonus_amount = self.bonus_amount # For system consistency
            self.min_deposit_amount = 0

        return self