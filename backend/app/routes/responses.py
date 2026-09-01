from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.concert import ConcertState
from app.models.response import Response
from app.models.song import Song, SongOption
from app.models.user import User
from app.schemas.response import (
    ResponseCreate,
    ResponseResult,
)


router = APIRouter(
    prefix="/responses",
    tags=["Responses"],
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


def get_concert_state(
    db: Session,
) -> ConcertState:
    concert = (
        db.query(ConcertState)
        .filter(ConcertState.id == 1)
        .first()
    )

    if not concert:
        raise HTTPException(
            status_code=409,
            detail="El estado del concierto no está disponible",
        )

    return concert


@router.post(
    "/",
    response_model=ResponseResult,
)
def save_response(
    response_data: ResponseCreate,
    db: Session = Depends(get_db),
):
    # 1. Validar usuario
    user = (
        db.query(User)
        .filter(User.id == response_data.user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="Usuario no encontrado",
        )

    # 2. Validar canción
    song = (
        db.query(Song)
        .filter(Song.id == response_data.song_id)
        .first()
    )

    if not song:
        raise HTTPException(
            status_code=404,
            detail="Canción no encontrada",
        )

    if not song.is_analyzable:
        raise HTTPException(
            status_code=403,
            detail="Esta canción no forma parte del análisis",
        )

    # 3. Validar estado del concierto
    concert = get_concert_state(db)

    if concert.state != "SONG_ACTIVE":
        raise HTTPException(
            status_code=403,
            detail="No hay una canción activa en este momento",
        )

    if concert.current_song_id != song.id:
        raise HTTPException(
            status_code=403,
            detail="Solo puedes responder la canción que está sonando",
        )

    if not concert.voting_open:
        raise HTTPException(
            status_code=403,
            detail="La votación no está abierta",
        )

    if not concert.voting_ends_at:
        raise HTTPException(
            status_code=403,
            detail="La votación no tiene una hora de cierre válida",
        )

    voting_ends_at = concert.voting_ends_at

    if voting_ends_at.tzinfo is None:
        voting_ends_at = voting_ends_at.replace(
            tzinfo=timezone.utc
        )

    if datetime.now(timezone.utc) >= voting_ends_at:
        raise HTTPException(
            status_code=403,
            detail="El tiempo para responder terminó",
        )

    # 4. Validar que la opción existe
    #    Y pertenece a la canción activa.
    option = (
        db.query(SongOption)
        .filter(
            SongOption.id == response_data.option_id,
            SongOption.song_id == song.id,
        )
        .first()
    )

    if not option:
        raise HTTPException(
            status_code=400,
            detail="La opción seleccionada no es válida para esta canción",
        )

    # 5. Impedir una segunda respuesta
    existing_response = (
        db.query(Response)
        .filter(
            Response.user_id == response_data.user_id,
            Response.song_id == response_data.song_id,
        )
        .first()
    )

    if existing_response:
        existing_response.selected_emotion = option.title
        existing_response.selected_option = option.title
        existing_response.option_value = option.value

        db.commit()
        db.refresh(existing_response)

        return existing_response

    # 6. El servidor obtiene nombre y puntuación
    #    directamente de song_options.
    new_response = Response(
        user_id=response_data.user_id,
        song_id=response_data.song_id,

        # Compatibilidad temporal con la BD actual.
        selected_emotion=option.title,

        selected_option=option.title,
        option_value=option.value,
    )

    db.add(new_response)
    db.commit()
    db.refresh(new_response)

    return new_response


@router.get(
    "/user/{user_id}",
    response_model=list[ResponseResult],
)
def get_user_responses(
    user_id: int,
    db: Session = Depends(get_db),
):
    return (
        db.query(Response)
        .filter(Response.user_id == user_id)
        .all()
    )