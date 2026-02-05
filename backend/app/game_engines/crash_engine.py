import random
import math
from .base_engine import BaseGameEngine

class CrashEngine(BaseGameEngine):
    def run(self, bet_amount: float, **kwargs):
        """
        config needs: {"max_multiplier": float, "house_edge": float}
        kwargs needs: {"target_multiplier": float}
        """
        max_mult = self.config.get("max_multiplier", 1000)
        house_edge = self.config.get("house_edge", 0.03)
        
        # Mathematical crash distribution
        r = random.random()
        crash_point = (1 - house_edge) / (1 - r)
        crash_point = min(max_mult, round(crash_point, 2))
        
        target = kwargs.get("target_multiplier", 1.5)
        is_win = target <= crash_point
        win_amount = bet_amount * target if is_win else 0.0

        return {
            "result_data": {"crash_at": crash_point, "cashed_out": target},
            "outcome": "WIN" if is_win else "LOSE",
            "win_amount": win_amount
        }