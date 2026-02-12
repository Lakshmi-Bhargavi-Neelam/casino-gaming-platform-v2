from pydantic import BaseModel
from uuid import UUID
from typing import Optional

class PlayRequest(BaseModel):
    game_id: UUID,
    tenant_id: UUID  # 🎯 ADD THIS FIELD
    bet_amount: float
    player_choice: str | None = None
    target_multiplier: float | None = None
    successful_picks: int | None = None
    # 🎯 NEW FIELD: Defaults to False (Normal Play)
    opt_in: bool = False 

class PlayGameResponse(BaseModel):
    game_id: UUID
    bet_amount: float
    win_amount: float
    outcome: dict
    new_balance: float