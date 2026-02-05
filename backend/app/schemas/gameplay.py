from pydantic import BaseModel
from uuid import UUID

class PlayGameRequest(BaseModel):
    bet_amount: float


class PlayGameResponse(BaseModel):
    game_id: UUID
    bet_amount: float
    win_amount: float
    outcome: dict
    new_balance: float
