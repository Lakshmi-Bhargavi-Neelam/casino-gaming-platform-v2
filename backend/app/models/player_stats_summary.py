import uuid
from sqlalchemy import Column, Integer, Numeric, TIMESTAMP, ForeignKey, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.base import Base

class PlayerStatsSummary(Base):
    __tablename__ = "player_stats_summary"

    # player_id links directly to user_id (Global Identity)
    player_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), primary_key=True)
    
    total_wagered = Column(Numeric(18, 2), default=0)
    total_won = Column(Numeric(18, 2), default=0)
    net_pnl = Column(Numeric(18, 2), default=0)
    
    total_sessions = Column(Integer, default=0)
    favorite_game_id = Column(UUID(as_uuid=True), ForeignKey("games.game_id"), nullable=True)
    
    last_played_at = Column(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP"))
    updated_at = Column(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP"), onupdate=text("CURRENT_TIMESTAMP"))

    # Relationships
    user = relationship("User")
    favorite_game = relationship("Game")