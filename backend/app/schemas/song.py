from pydantic import BaseModel

class SongCreate(BaseModel):
    title: str
    description: str

class SongResponse(BaseModel):
    id: int
    title: str
    description: str
    is_unlocked: bool

    class Config:
        from_attributes = True