from sqlalchemy import Boolean, Column, Integer, String, Text

from app.database import Base


class Song(Base):
    __tablename__ = "songs"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    title = Column(
        String,
        nullable=False,
    )

    description = Column(
        Text,
        nullable=False,
    )

    is_unlocked = Column(
        Boolean,
        nullable=False,
        default=False,
    )

    analysis_category = Column(
        String(50),
        nullable=True,
    )

    question_text = Column(
        Text,
        nullable=True,
    )

    display_order = Column(
        Integer,
        nullable=True,
    )

    duration_seconds = Column(
        Integer,
        nullable=True,
    )

    is_analyzable = Column(
        Boolean,
        nullable=False,
        default=True,
    )