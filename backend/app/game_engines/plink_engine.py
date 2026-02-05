import random
from .base_engine import BaseGameEngine

class PlinkoEngine(BaseGameEngine):
    def run(self, bet_amount: float, **kwargs):
        """
        config needs: {"rows": int, "risk_level": str, "bucket_multipliers": list}
        """
        rows = self.config.get("rows", 8)
        # Multipliers are mapped based on the final horizontal index (0 to rows)
        multipliers = self.config.get("bucket_multipliers", [5, 2, 0.5, 0.2, 0.2, 0.5, 2, 5])
        
        # Simulate ball falling: 0 = left, 1 = right
        path = [random.randint(0, 1) for _ in range(rows)]
        final_index = sum(path)
        
        multiplier = multipliers[final_index]
        win_amount = bet_amount * multiplier

        return {
            "result_data": {"path": path, "bucket": final_index},
            "outcome": "WIN" if multiplier >= 1 else "LOSE",
            "win_amount": win_amount
        }