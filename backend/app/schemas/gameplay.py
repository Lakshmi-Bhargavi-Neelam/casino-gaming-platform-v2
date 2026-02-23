from pydantic import BaseModel
from uuid import UUID
import uuid
from typing import Optional


class PlayRequest(BaseModel):
    game_id: uuid.UUID
    tenant_id: UUID 
    bet_amount: float
    player_choice: Optional[str] = None
    target_multiplier: Optional[float] = None
    successful_picks: Optional[int] = None
    
   
    opt_in: bool = False 

class PlayGameResponse(BaseModel):
    game_id: UUID
    bet_amount: float
    win_amount: float
    outcome: dict
    new_balance: float