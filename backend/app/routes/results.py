from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.response import Response
from app.models.song import Song
from app.models.user import User
from app.schemas.result import ParticipationResult


router = APIRouter(
    prefix="/results",
    tags=["Results"],
)

MINIMUM_REQUIRED_RESPONSES = 10


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


@router.get(
    "/user/{user_id}/participation",
    response_model=ParticipationResult,
)
def get_user_participation(
    user_id: int,
    db: Session = Depends(get_db),
):
    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="Usuario no encontrado",
        )

    total_questions = (
        db.query(func.count(Song.id))
        .filter(Song.is_analyzable.is_(True))
        .scalar()
        or 0
    )

    answered_count = (
        db.query(
            func.count(
                func.distinct(Response.song_id)
            )
        )
        .join(
            Song,
            Response.song_id == Song.id,
        )
        .filter(
            Response.user_id == user_id,
            Song.is_analyzable.is_(True),
        )
        .scalar()
        or 0
    )

    meets_minimum = (
        answered_count
        >= MINIMUM_REQUIRED_RESPONSES
    )

    remaining_required = max(
        0,
        MINIMUM_REQUIRED_RESPONSES
        - answered_count,
    )

    return ParticipationResult(
        user_id=user_id,
        answered_count=answered_count,
        total_questions=total_questions,
        minimum_required=MINIMUM_REQUIRED_RESPONSES,
        meets_minimum=meets_minimum,
        remaining_required=remaining_required,
    )