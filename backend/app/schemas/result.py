from pydantic import BaseModel


class ParticipationResult(BaseModel):
    user_id: int
    answered_count: int
    total_questions: int
    minimum_required: int
    meets_minimum: bool
    remaining_required: int