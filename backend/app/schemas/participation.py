from datetime import datetime

from pydantic import Field

from app.models.participation import ParticipationStatus
from app.schemas.common import ORMModel


class ParticipationCreate(ORMModel):
    event_id: int = Field(gt=0)
    user_id: int = Field(gt=0)


class ParticipationUpdate(ORMModel):
    status: ParticipationStatus


class ParticipationRead(ORMModel):
    id: int
    event_id: int
    user_id: int
    status: ParticipationStatus
    joined_at: datetime
