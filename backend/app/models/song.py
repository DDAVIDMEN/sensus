from sqlalchemy import (
    Boolean,
    Column,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship

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

    options = relationship(
        "SongOption",
        back_populates="song",
        cascade="all, delete-orphan",
        order_by="SongOption.option_order",
    )


class SongOption(Base):
    __tablename__ = "song_options"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    song_id = Column(
        Integer,
        ForeignKey(
            "songs.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    option_order = Column(
        Integer,
        nullable=False,
    )

    title = Column(
        String(150),
        nullable=False,
    )

    subtitle = Column(
        String(255),
        nullable=True,
    )

    description = Column(
        Text,
        nullable=True,
    )

    value = Column(
        Integer,
        nullable=False,
    )

    song = relationship(
        "Song",
        back_populates="options",
    )