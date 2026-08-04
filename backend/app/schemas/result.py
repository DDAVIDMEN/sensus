from pydantic import BaseModel


class ParticipationResult(BaseModel):
    user_id: int
    answered_count: int
    total_questions: int
    minimum_required: int
    meets_minimum: bool
    remaining_required: int


class GlobalOptionResult(BaseModel):
    option: str
    count: int
    percentage: float


class GlobalSongResult(BaseModel):
    song_id: int
    title: str
    display_order: int | None
    analysis_category: str | None
    response_count: int
    top_option: str | None
    options: list[GlobalOptionResult]


class GlobalResultsResponse(BaseModel):
    total_participants: int
    total_responses: int
    total_analyzable_songs: int
    average_responses_per_participant: float
    songs: list[GlobalSongResult]