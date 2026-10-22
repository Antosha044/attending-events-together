from datetime import datetime

from pydantic import Field, field_validator

from app.models.event import EventStatus
from app.schemas.common import ORMModel


class EventFields(ORMModel):
    title: str = Field(min_length=1, max_length=160)
    category: str = Field(default="Другое", min_length=1, max_length=80)
    city: str = Field(default="Москва", min_length=1, max_length=100)
    description: str | None = None
    venue: str = Field(min_length=1, max_length=200)
    address: str | None = Field(default=None, max_length=300)
    price: str = Field(default="Бесплатно", max_length=40)
    image: str = Field(default="", max_length=2000)
    starts_at: datetime
    capacity: int = Field(gt=0)
    status: EventStatus = EventStatus.PUBLISHED

    @field_validator("starts_at")
    @classmethod
    def require_timezone(cls, value: datetime) -> datetime:
        if value.tzinfo is None or value.utcoffset() is None:
            raise ValueError("starts_at must include a timezone offset")
        return value


class EventCreate(EventFields):
    pass


class EventUpdate(ORMModel):
    title: str | None = Field(default=None, min_length=1, max_length=160)
    category: str | None = Field(default=None, min_length=1, max_length=80)
    city: str | None = Field(default=None, min_length=1, max_length=100)
    description: str | None = None
    venue: str | None = Field(default=None, min_length=1, max_length=200)
    address: str | None = Field(default=None, max_length=300)
    price: str | None = Field(default=None, max_length=40)
    image: str | None = Field(default=None, max_length=2000)
    starts_at: datetime | None = None
    capacity: int | None = Field(default=None, gt=0)
    status: EventStatus | None = None

    @field_validator("starts_at")
    @classmethod
    def require_timezone(cls, value: datetime | None) -> datetime | None:
        if value is not None and (value.tzinfo is None or value.utcoffset() is None):
            raise ValueError("starts_at must include a timezone offset")
        return value


class EventRead(ORMModel):
    id: int
    title: str
    category: str
    city: str
    description: str | None
    venue: str
    address: str | None
    price: str
    image: str
    starts_at: datetime
    capacity: int
    status: EventStatus
    creator_id: int
    host_name: str
    going: int
    created_at: datetime
    updated_at: datetime
