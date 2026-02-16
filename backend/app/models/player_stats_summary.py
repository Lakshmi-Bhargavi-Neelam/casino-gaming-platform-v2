import uuid
from sqlalchemy import Column, Integer, Numeric, TIMESTAMP, ForeignKey, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.base import Base

class PlayerStatsSummary(Base):
    __tablename__ = "player_stats_summary"

    # Primary Key & Link to Global User Identity
    player_id = Column(
        UUID(as_uuid=True), 
        ForeignKey("users.user_id"), 
        primary_key=True
    )
    
    # Financial Metrics (Numeric for precision)
    total_wagered = Column(Numeric(18, 2), default=0)
    total_won = Column(Numeric(18, 2), default=0)
    net_pnl = Column(Numeric(18, 2), default=0)
    total_deposits = Column(Numeric(18, 2), default=0)
    
    # Activity Metrics (Integers)
    total_sessions = Column(Integer, default=0)
    total_play_time_seconds = Column(Integer, default=0)
    win_count = Column(Integer, default=0)
    loss_count = Column(Integer, default=0)
    
    # Game Context
    favorite_game_id = Column(
        UUID(as_uuid=True), 
        ForeignKey("games.game_id"), 
        nullable=True
    )
    
    # Timestamps
    last_played_at = Column(
        TIMESTAMP, 
        server_default=text("CURRENT_TIMESTAMP")
    )
    updated_at = Column(
        TIMESTAMP, 
        server_default=text("CURRENT_TIMESTAMP"), 
        onupdate=text("CURRENT_TIMESTAMP")
    )

    # Relationships
    user = relationship("User")
    favorite_game = relationship("Game")