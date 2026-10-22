from datetime import datetime

from pydantic import Field

from app.schemas.common import ORMModel


class AttendanceCreate(ORMModel):
    event_id: int = Field(gt=0)
    user_id: int = Field(gt=0)
    attended: bool


class AttendanceUpdate(ORMModel):
    attended: bool


class AttendanceRead(ORMModel):
    id: int
    event_id: int
    user_id: int
    attended: bool
    checked_at: datetime
