from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.dependencies import get_current_admin
from app.models.song import Song
from app.models.user import User
from app.schemas.song import SongCreate, SongResponse


router = APIRouter(
    prefix="/songs",
    tags=["Songs"],
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


@router.post(
    "/",
    response_model=SongResponse,
)
def create_song(
    song_data: SongCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    new_song = Song(
        title=song_data.title,
        description=song_data.description,
        analysis_category=song_data.analysis_category,
        question_text=song_data.question_text,
        display_order=song_data.display_order,
        duration_seconds=song_data.duration_seconds,
        is_analyzable=song_data.is_analyzable,
    )

    db.add(new_song)
    db.commit()
    db.refresh(new_song)

    return new_song


@router.get(
    "/",
    response_model=list[SongResponse],
)
def get_songs(
    db: Session = Depends(get_db),
):
    return (
        db.query(Song)
        .order_by(
            Song.display_order.asc().nullslast(),
            Song.id.asc(),
        )
        .all()
    )


@router.get(
    "/analyzable",
    response_model=list[SongResponse],
)
def get_analyzable_songs(
    db: Session = Depends(get_db),
):
    return (
        db.query(Song)
        .filter(Song.is_analyzable.is_(True))
        .order_by(
            Song.display_order.asc().nullslast(),
            Song.id.asc(),
        )
        .all()
    )


@router.patch(
    "/{song_id}/unlock",
    response_model=SongResponse,
)
def unlock_song(
    song_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    song = (
        db.query(Song)
        .filter(Song.id == song_id)
        .first()
    )

    if not song:
        raise HTTPException(
            status_code=404,
            detail="Canción no encontrada",
        )

    song.is_unlocked = True

    db.commit()
    db.refresh(song)

    return song


@router.patch(
    "/{song_id}/lock",
    response_model=SongResponse,
)
def lock_song(
    song_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    song = (
        db.query(Song)
        .filter(Song.id == song_id)
        .first()
    )

    if not song:
        raise HTTPException(
            status_code=404,
            detail="Canción no encontrada",
        )

    song.is_unlocked = False

    db.commit()
    db.refresh(song)

    return song


@router.get(
    "/available",
    response_model=list[SongResponse],
)
def get_available_songs(
    db: Session = Depends(get_db),
):
    return (
        db.query(Song)
        .filter(Song.is_unlocked.is_(True))
        .order_by(
            Song.display_order.asc().nullslast(),
            Song.id.asc(),
        )
        .all()
    )