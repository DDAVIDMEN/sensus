from pydantic import BaseModel


class ResponseCreate(BaseModel):
    user_id: int
    song_id: int

    # Por ahora el frontend seguirá enviando este campo.
    selected_emotion: str

    # Se utilizarán cuando el equipo entregue
    # las opciones y sus valores definitivos.
    selected_option: str | None = None
    option_value: int | None = None


class ResponseUpdate(BaseModel):
    selected_emotion: str
    selected_option: str | None = None
    option_value: int | None = None


class ResponseResult(BaseModel):
    id: int
    user_id: int
    song_id: int

    selected_emotion: str
    selected_option: str | None
    option_value: int | None

    class Config:
        from_attributes = True
        
