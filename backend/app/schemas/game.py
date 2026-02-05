from pydantic import BaseModel, Field
from typing import Any, Dict

class GameCreate(BaseModel):
    category_id: int
    game_name: str
    game_code: str
    rtp_percentage: float | None = 98.0
    volatility: str | None = "MEDIUM"
    min_bet: float = Field(gt=0)
    max_bet: float = Field(gt=0)
    engine_type: str  # 'dice_engine', 'slot_engine', etc.
    engine_config: Dict[str, Any] # The JSON logic