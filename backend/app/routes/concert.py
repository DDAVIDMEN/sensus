from datetime import (
    datetime,
    timedelta,
    timezone,
)

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.dependencies import get_current_admin
from app.models.concert import ConcertState
from app.models.song import Song
from app.models.user import User
from app.schemas.concert import (
    ConcertStateResponse,
    SponsorStateRequest,
)


router = APIRouter(
    prefix="/concert",
    tags=["Concert"],
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


def get_or_create_concert_state(
    db: Session,
) -> ConcertState:
    concert = (
        db.query(ConcertState)
        .filter(ConcertState.id == 1)
        .first()
    )

    if concert:
        return concert

    concert = ConcertState(
        id=1,
        state="WAITING_START",
        current_song_id=None,
        voting_open=False,
        voting_ends_at=None,
        sponsor_name=None,
    )

    db.add(concert)
    db.commit()
    db.refresh(concert)

    return concert



 # Esta ruta sigue pública porque los usuarios
 # necesitan consultar el estado del concierto.
 
@router.get(
    "/state",
    response_model=ConcertStateResponse,
)
def get_concert_state(
    db: Session = Depends(get_db),
):
    return get_or_create_concert_state(db)


@router.post(
    "/waiting-start",
    response_model=ConcertStateResponse,
)
def set_waiting_start(
    db: Session = Depends(get_db),
    admin: User = Depends(
        get_current_admin
    ),
):
    concert = get_or_create_concert_state(
        db
    )

    concert.state = "WAITING_START"
    concert.current_song_id = None
    concert.voting_open = False
    concert.voting_ends_at = None
    concert.sponsor_name = None

    db.commit()
    db.refresh(concert)

    return concert


@router.post(
    "/songs/{song_id}/start",
    response_model=ConcertStateResponse,
)
def start_song(
    song_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(
        get_current_admin
    ),
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

    concert = get_or_create_concert_state(
        db
    )

    concert.state = "SONG_ACTIVE"
    concert.current_song_id = song.id
    concert.voting_open = False
    concert.voting_ends_at = None
    concert.sponsor_name = None

    db.commit()
    db.refresh(concert)

    return concert


@router.post(
    "/voting/open",
    response_model=ConcertStateResponse,
)
def open_voting(
    db: Session = Depends(get_db),
    admin: User = Depends(
        get_current_admin
    ),
):
    concert = get_or_create_concert_state(
        db
    )

    if concert.state != "SONG_ACTIVE":
        raise HTTPException(
            status_code=400,
            detail="No hay una canción activa",
        )

    concert.voting_open = True
    concert.voting_ends_at = (
        datetime.now(timezone.utc)
        + timedelta(seconds=15)
    )

    db.commit()
    db.refresh(concert)

    return concert


@router.post(
    "/voting/close",
    response_model=ConcertStateResponse,
)
def close_voting(
    db: Session = Depends(get_db),
    admin: User = Depends(
        get_current_admin
    ),
):
    concert = get_or_create_concert_state(
        db
    )

    concert.voting_open = False
    concert.voting_ends_at = None

    db.commit()
    db.refresh(concert)

    return concert


@router.post(
    "/sponsor",
    response_model=ConcertStateResponse,
)
def show_sponsor(
    sponsor_data: SponsorStateRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(
        get_current_admin
    ),
):
    concert = get_or_create_concert_state(
        db
    )

    concert.state = "SPONSOR"
    concert.voting_open = False
    concert.voting_ends_at = None
    concert.sponsor_name = (
        sponsor_data.sponsor_name
    )

    db.commit()
    db.refresh(concert)

    return concert


@router.post(
    "/finish",
    response_model=ConcertStateResponse,
)
def finish_concert(
    db: Session = Depends(get_db),
    admin: User = Depends(
        get_current_admin
    ),
):
    concert = get_or_create_concert_state(
        db
    )

    concert.state = "FINISHED"
    concert.current_song_id = None
    concert.voting_open = False
    concert.voting_ends_at = None
    concert.sponsor_name = None

    db.commit()
    db.refresh(concert)

    return concert