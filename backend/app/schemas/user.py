from datetime import datetime

from pydantic import EmailStr, Field

from app.schemas.common import ORMModel


class UserCreate(ORMModel):
    display_name: str = Field(min_length=1, max_length=80)
    email: EmailStr
    city: str = Field(default="Москва", min_length=1, max_length=100)


class UserUpdate(ORMModel):
    display_name: str | None = Field(default=None, min_length=1, max_length=80)
    email: EmailStr | None = None
    city: str | None = Field(default=None, min_length=1, max_length=100)


class UserRead(ORMModel):
    id: int
    display_name: str
    email: EmailStr
    city: str
    created_at: datetime
