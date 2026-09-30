from sqlalchemy import func, select
from sqlalchemy.orm import Session

from fastapi import HTTPException

from app.models.event import Event
from app.models.participation import Participation, ParticipationStatus


def ensure_space(db: Session, event: Event, current_participation_id: int | None = None) -> None:
    query = select(func.count(Participation.id)).where(
        Participation.event_id == event.id,
        Participation.status == ParticipationStatus.JOINED.value,
    )
    if current_participation_id is not None:
        query = query.where(Participation.id != current_participation_id)
    joined = db.scalar(query) or 0
    if joined >= event.capacity:
        raise HTTPException(status_code=409, detail="The event has reached its participant capacity")
