from pydantic import BaseModel

class ResponseCreate(BaseModel):
    user_id: int
    song_id: int
    selected_emotion: str

class ResponseUpdate(BaseModel):
    selected_emotion: str

class ResponseResult(BaseModel):
    id: int
    user_id: int
    song_id: int
    selected_emotion: str

    class Config:
        from_attributes = True