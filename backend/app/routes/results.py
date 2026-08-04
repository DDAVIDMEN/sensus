from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.response import Response
from app.models.song import Song
from app.models.user import User
from app.schemas.result import (
    GlobalOptionResult,
    GlobalResultsResponse,
    GlobalSongResult,
    ParticipationResult,
)


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


@router.get(
    "/global",
    response_model=GlobalResultsResponse,
)
def get_global_results(
    db: Session = Depends(get_db),
):
    analyzable_songs = (
        db.query(Song)
        .filter(Song.is_analyzable.is_(True))
        .order_by(
            Song.display_order.asc().nullslast(),
            Song.id.asc(),
        )
        .all()
    )

    total_analyzable_songs = len(
        analyzable_songs
    )

    total_responses = (
        db.query(func.count(Response.id))
        .join(
            Song,
            Response.song_id == Song.id,
        )
        .filter(
            Song.is_analyzable.is_(True)
        )
        .scalar()
        or 0
    )

    total_participants = (
        db.query(
            func.count(
                func.distinct(Response.user_id)
            )
        )
        .join(
            Song,
            Response.song_id == Song.id,
        )
        .filter(
            Song.is_analyzable.is_(True)
        )
        .scalar()
        or 0
    )

    average_responses_per_participant = (
        round(
            total_responses
            / total_participants,
            2,
        )
        if total_participants > 0
        else 0.0
    )

    songs_results: list[
        GlobalSongResult
    ] = []

    for song in analyzable_songs:
        responses = (
            db.query(Response)
            .filter(
                Response.song_id == song.id
            )
            .all()
        )

        response_count = len(responses)

        option_counts: dict[str, int] = {}

        for response in responses:
            option = (
                response.selected_option
                or response.selected_emotion
            )

            if not option:
                continue

            option_counts[option] = (
                option_counts.get(option, 0)
                + 1
            )

        sorted_options = sorted(
            option_counts.items(),
            key=lambda item: (
                -item[1],
                item[0].lower(),
            ),
        )

        options = [
            GlobalOptionResult(
                option=option,
                count=count,
                percentage=round(
                    (
                        count
                        / response_count
                        * 100
                    )
                    if response_count > 0
                    else 0,
                    1,
                ),
            )
            for option, count
            in sorted_options
        ]

        top_option = (
            sorted_options[0][0]
            if sorted_options
            else None
        )

        songs_results.append(
            GlobalSongResult(
                song_id=song.id,
                title=song.title,
                display_order=(
                    song.display_order
                ),
                analysis_category=(
                    song.analysis_category
                ),
                response_count=(
                    response_count
                ),
                top_option=top_option,
                options=options,
            )
        )

    return GlobalResultsResponse(
        total_participants=(
            total_participants
        ),
        total_responses=total_responses,
        total_analyzable_songs=(
            total_analyzable_songs
        ),
        average_responses_per_participant=(
            average_responses_per_participant
        ),
        songs=songs_results,
    )