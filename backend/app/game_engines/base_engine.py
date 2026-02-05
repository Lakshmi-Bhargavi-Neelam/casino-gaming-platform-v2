class BaseGameEngine:
    def __init__(self, config: dict):
        """
        config: The engine_config JSON stored in the database.
        """
        self.config = config

    def validate_bet(self, bet_amount: float, min_bet: float, max_bet: float):
        if bet_amount < min_bet or bet_amount > max_bet:
            raise ValueError(f"Bet amount {bet_amount} is outside allowed range ({min_bet}-{max_bet})")

    def run(self, bet_amount: float, **kwargs):
        """
        Accepts variable keyword arguments to handle different engine inputs.
        """
        raise NotImplementedError("Each engine must implement its own run logic")