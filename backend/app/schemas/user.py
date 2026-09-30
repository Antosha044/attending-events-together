from datetime import datetime

from pydantic import EmailStr, Field

from app.schemas.common import ORMModel


class UserCreate(ORMModel):
    display_name: str = Field(min_length=1, max_length=80)
    email: EmailStr


class UserUpdate(ORMModel):
    display_name: str | None = Field(default=None, min_length=1, max_length=80)
    email: EmailStr | None = None


class UserRead(ORMModel):
    id: int
    display_name: str
    email: EmailStr
    created_at: datetime
