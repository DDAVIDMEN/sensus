from fastapi import FastAPI
from app.database import engine, Base
from app.models.user import User
from app.routes.auth import router as auth_router
from app.models.song import Song
from app.routes.songs import router as songs_router
from app.models.response import Response
from app.routes.responses import router as responses_router
from fastapi.middleware.cors import CORSMiddleware




app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(auth_router)
app.include_router(songs_router)
app.include_router(responses_router)

@app.get("/")
def root():
    return {"message": "Backend funcionando"}