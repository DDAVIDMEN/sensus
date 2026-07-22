from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.sql import func

from app.database import Base


class ConcertState(Base):
    __tablename__ = "concert_state"

    id = Column(Integer, primary_key=True, default=1)

    state = Column(
        String,
        nullable=False,
        default="WAITING_START"
    )

    current_song_id = Column(
        Integer,
        ForeignKey("songs.id"),
        nullable=True
    )

    voting_open = Column(
        Boolean,
        nullable=False,
        default=False
    )

    voting_ends_at = Column(
        DateTime(timezone=True),
        nullable=True
    )

    sponsor_name = Column(
        String,
        nullable=True
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )