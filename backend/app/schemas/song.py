from pydantic import BaseModel


class SongCreate(BaseModel):
    title: str
    description: str


class SongOptionResponse(BaseModel):
    id: int
    option_order: int
    title: str
    subtitle: str | None = None
    description: str | None = None
    value: int

    class Config:
        from_attributes = True


class SongResponse(BaseModel):
    id: int
    title: str
    description: str
    is_unlocked: bool

    analysis_category: str | None = None
    question_text: str | None = None
    display_order: int | None = None
    duration_seconds: int | None = None
    is_analyzable: bool

    options: list[SongOptionResponse] = []

    class Config:
        from_attributes = True