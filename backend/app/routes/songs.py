from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.song import Song
from app.schemas.song import SongCreate, SongResponse


router = APIRouter(prefix="/songs", tags=["Songs"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=SongResponse)
def create_song(song_data: SongCreate, db: Session = Depends(get_db)):

    new_song = Song(
        title=song_data.title,
        description=song_data.description
    )

    db.add(new_song)
    db.commit()
    db.refresh(new_song)

    return new_song

@router.get("/", response_model=list[SongResponse])
def get_songs(db: Session = Depends(get_db)):
    from fastapi import HTTPException
    songs = db.query(Song).all()

    return songs

@router.patch("/{song_id}/unlock", response_model=SongResponse)
def unlock_song(song_id: int, db: Session = Depends(get_db)):

    song = db.query(Song).filter(Song.id == song_id).first()

    if not song:
        raise HTTPException(status_code=404, detail="Canción no encontrada")

    song.is_unlocked = True

    db.commit()
    db.refresh(song)

    return song


@router.patch("/{song_id}/lock", response_model=SongResponse)
def lock_song(song_id: int, db: Session = Depends(get_db)):

    song = db.query(Song).filter(Song.id == song_id).first()

    if not song:
        raise HTTPException(status_code=404, detail="Canción no encontrada")

    song.is_unlocked = False

    db.commit()
    db.refresh(song)

    return song


@router.get("/available", response_model=list[SongResponse])
def get_available_songs(db: Session = Depends(get_db)):

    songs = db.query(Song).filter(Song.is_unlocked == True).all()

    return songs