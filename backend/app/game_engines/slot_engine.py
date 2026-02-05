import random
from .base_engine import BaseGameEngine

class SlotEngine(BaseGameEngine):
    def run(self, bet_amount: float, **kwargs):
        """
        config needs: {
            "reels": int, 
            "paylines": int, 
            "symbol_map": list, 
            "paytable": dict
        }
        """
        reels = self.config.get("reels", 3)
        symbol_map = self.config.get("symbol_map", ["A", "B", "C", "7"])
        paytable = self.config.get("paytable", {"777": 50, "AAA": 10, "BBB": 5, "CCC": 2})
        
        # Generate spin result (e.g., ['7', 'A', '7'])
        result = [random.choice(symbol_map) for _ in range(reels)]
        result_str = "".join(result)
        
        # Check paytable for the combination
        multiplier = paytable.get(result_str, 0)
        win_amount = bet_amount * multiplier

        return {
            "result_data": {"spin": result},
            "outcome": "WIN" if win_amount > 0 else "LOSE",
            "win_amount": win_amount
        }