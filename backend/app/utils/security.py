from datetime import datetime, timedelta, timezone
import os

from jose import jwt
from passlib.context import CryptContext

from dotenv import load_dotenv
from pathlib import Path


pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
)

env_path = (
    Path(__file__)
    .resolve()
    .parent
    .parent
    .parent
    / ".env"
)

load_dotenv(dotenv_path=env_path)

SECRET_KEY = os.getenv("SECRET_KEY")

if not SECRET_KEY:
    raise RuntimeError(
        "SECRET_KEY no está definida. "
        "Configúrala en las variables de entorno."
    )

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60


def hash_password(password: str):
    return pwd_context.hash(password)


def verify_password(
    plain_password: str,
    hashed_password: str,
):
    return pwd_context.verify(
        plain_password,
        hashed_password,
    )


def create_access_token(data: dict):
    to_encode = data.copy()

    expire = (
        datetime.now(timezone.utc)
        + timedelta(
            minutes=
            ACCESS_TOKEN_EXPIRE_MINUTES
        )
    )

    to_encode.update({
        "exp": expire
    })

    return jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM,
    )