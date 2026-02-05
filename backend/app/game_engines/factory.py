from .dice_engine import DiceEngine
# Import other engines here as you create them

class EngineFactory:
    _engines = {
        "dice_engine": DiceEngine,
        # "slot_engine": SlotEngine, etc.
    }

    @classmethod
    def get_engine(cls, engine_type: str, config: dict):
        engine_class = cls._engines.get(engine_type)
        if not engine_class:
            raise ValueError(f"Unknown engine: {engine_type}")
        return engine_class(config)