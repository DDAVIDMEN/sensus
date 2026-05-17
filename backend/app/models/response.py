from sqlalchemy import Column, Integer, String, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database import Base

class Response(Base):
    __tablename__ = "responses"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    song_id = Column(Integer, ForeignKey("songs.id"), nullable=False)

    selected_emotion = Column(String, nullable=False)

    user = relationship("User")
    song = relationship("Song")

    __table_args__ = (
        UniqueConstraint("user_id", "song_id", name="unique_user_song_response"),
    )