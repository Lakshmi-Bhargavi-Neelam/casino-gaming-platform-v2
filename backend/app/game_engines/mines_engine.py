import math
from .base_engine import BaseGameEngine

class MinesEngine(BaseGameEngine):
    def run(self, bet_amount: float, **kwargs):
        """
        config needs: {"grid_size": int, "mine_count": int, "multiplier_curve": float}
        kwargs needs: {"successful_picks": int}
        """
        grid_size = self.config.get("grid_size", 25)
        mines = self.config.get("mine_count", 3)
        picks = kwargs.get("successful_picks", 1)
        curve = self.config.get("multiplier_curve", 0.97) # House edge factor
        
        # Calculate theoretical multiplier: nCr(total, mines) / nCr(remaining, mines)
        total_combinations = math.comb(grid_size, mines)
        remaining_combinations = math.comb(grid_size - picks, mines)
        
        multiplier = (total_combinations / remaining_combinations) * curve
        win_amount = bet_amount * multiplier

        return {
            "result_data": {"picks": picks, "mines": mines},
            "outcome": "WIN",
            "win_amount": round(win_amount, 2),
            "multiplier": round(multiplier, 2)
        }