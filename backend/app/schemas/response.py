from pydantic import BaseModel


class ResponseCreate(BaseModel):
    user_id: int
    song_id: int
    option_id: int


class ResponseResult(BaseModel):
    id: int
    user_id: int
    song_id: int

    selected_emotion: str
    selected_option: str | None
    option_value: int | None

    class Config:
        from_attributes = True