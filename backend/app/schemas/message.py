from datetime import datetime

from pydantic import Field

from app.schemas.common import ORMModel


class MessageCreate(ORMModel):
    event_id: int = Field(gt=0)
    author_id: int = Field(gt=0)
    body: str = Field(min_length=1, max_length=4000)


class MessageUpdate(ORMModel):
    body: str = Field(min_length=1, max_length=4000)


class MessageRead(ORMModel):
    id: int
    event_id: int
    author_id: int
    body: str
    sent_at: datetime
