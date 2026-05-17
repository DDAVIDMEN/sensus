from sqlalchemy import Column, Integer, String, Boolean
from app.database import Base

class Song(Base):
    __tablename__ = "songs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    is_unlocked = Column(Boolean, default=False)