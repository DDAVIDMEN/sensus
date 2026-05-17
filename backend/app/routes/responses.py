from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.response import Response
from app.models.song import Song
from app.models.user import User
from app.schemas.response import ResponseCreate, ResponseResult

router = APIRouter(prefix="/responses", tags=["Responses"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=ResponseResult)
def save_response(response_data: ResponseCreate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == response_data.user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    song = db.query(Song).filter(Song.id == response_data.song_id).first()

    if not song:
        raise HTTPException(status_code=404, detail="Canción no encontrada")

    if not song.is_unlocked:
        raise HTTPException(status_code=403, detail="Esta canción todavía está bloqueada")

    existing_response = (
        db.query(Response)
        .filter(
            Response.user_id == response_data.user_id,
            Response.song_id == response_data.song_id
        )
        .first()
    )

    if existing_response:
        existing_response.selected_emotion = response_data.selected_emotion
        db.commit()
        db.refresh(existing_response)
        return existing_response

    new_response = Response(
        user_id=response_data.user_id,
        song_id=response_data.song_id,
        selected_emotion=response_data.selected_emotion
    )

    db.add(new_response)
    db.commit()
    db.refresh(new_response)

    return new_response

@router.get("/user/{user_id}", response_model=list[ResponseResult])
def get_user_responses(user_id: int, db: Session = Depends(get_db)):
    responses = db.query(Response).filter(Response.user_id == user_id).all()
    return responses