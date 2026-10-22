from pydantic import EmailStr, Field

from app.schemas.common import ORMModel
from app.schemas.user import UserRead


class Credentials(ORMModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class RegisterRequest(Credentials):
    display_name: str = Field(min_length=1, max_length=80)
    city: str = Field(default="Москва", min_length=1, max_length=100)


class TokenPair(ORMModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserRead


class RefreshRequest(ORMModel):
    refresh_token: str = Field(min_length=32, max_length=200)


class ParticipantRead(ORMModel):
    id: int
    display_name: str
    status: str
