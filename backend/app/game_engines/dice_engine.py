import random
from .base_engine import BaseGameEngine

class DiceEngine(BaseGameEngine):
    def run(self, bet_amount: float, **kwargs):
        """
        config needs: {"multiplier": float, "house_edge": float}
        kwargs needs: {"player_choice": str}  # e.g., "EVEN", "ODD"
        """
        multiplier = self.config.get("multiplier", 1.98)
        house_edge = self.config.get("house_edge", 0.02)
        
        # Adjusting payout based on house edge if not already baked into multiplier
        adjusted_multiplier = multiplier * (1 - house_edge)
        
        roll = random.randint(1, 6)
        result_type = "EVEN" if roll % 2 == 0 else "ODD"
        
        player_choice = kwargs.get("player_choice", "").upper()
        is_win = player_choice == result_type
        win_amount = bet_amount * adjusted_multiplier if is_win else 0.0

        return {
            "result_data": {"roll": roll, "result": result_type},
            "outcome": "WIN" if is_win else "LOSE",
            "win_amount": round(win_amount, 2)
        }