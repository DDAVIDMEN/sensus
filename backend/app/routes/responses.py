from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.concert import ConcertState
from app.models.response import Response
from app.models.song import Song
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

    # PostgreSQL puede devolver una fecha sin zona horaria,
    # dependiendo de la configuración de la columna.
    if voting_ends_at.tzinfo is None:
        voting_ends_at = voting_ends_at.replace(
            tzinfo=timezone.utc
        )

    if datetime.now(timezone.utc) >= voting_ends_at:
        raise HTTPException(
            status_code=403,
            detail="El tiempo para responder terminó",
        )

    selected_option = (
        response_data.selected_option
        or response_data.selected_emotion
    )

    existing_response = (
        db.query(Response)
        .filter(
            Response.user_id
            == response_data.user_id,
            Response.song_id
            == response_data.song_id,
        )
        .first()
    )

    if existing_response:
        existing_response.selected_emotion = (
            response_data.selected_emotion
        )
        existing_response.selected_option = (
            selected_option
        )
        existing_response.option_value = (
            response_data.option_value
        )

        db.commit()
        db.refresh(existing_response)

        return existing_response

    new_response = Response(
        user_id=response_data.user_id,
        song_id=response_data.song_id,
        selected_emotion=(
            response_data.selected_emotion
        ),
        selected_option=selected_option,
        option_value=response_data.option_value,
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