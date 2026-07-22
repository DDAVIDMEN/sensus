from datetime import datetime
from typing import Literal

from pydantic import BaseModel


ConcertStatus = Literal[
    "WAITING_START",
    "SONG_ACTIVE",
    "SPONSOR",
    "FINISHED",
]


class ConcertStateResponse(BaseModel):
    id: int
    state: ConcertStatus
    current_song_id: int | None
    voting_open: bool
    voting_ends_at: datetime | None
    sponsor_name: str | None

    class Config:
        from_attributes = True


class SponsorStateRequest(BaseModel):
    sponsor_name: str | None = None