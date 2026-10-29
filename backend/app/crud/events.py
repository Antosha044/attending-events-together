from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.exceptions import ConflictError
from app.crud.base import add
from app.models.attendance import Attendance
from app.models.event import Event, EventStatus
from app.models.participation import Participation, ParticipationStatus
from app.models.user import User


def list_events(
    db: Session, status: EventStatus | None, search: str | None, offset: int, limit: int
) -> list[Event]:
    query = (
        select(Event).order_by(Event.starts_at, Event.id).offset(offset).limit(limit)
    )
    if status:
        query = query.where(Event.status == status.value)
    if search:
        query = query.where(Event.title.ilike(f"%{search}%"))
    return list(db.scalars(query))


def participating(db: Session, user_id: int) -> list[Event]:
    query = (
        select(Event)
        .join(Participation, Participation.event_id == Event.id)
        .where(
            Participation.user_id == user_id,
            Participation.status == ParticipationStatus.JOINED.value,
        )
        .order_by(Event.starts_at, Event.id)
    )
    return list(db.scalars(query))


def participant_rows(db: Session, event_id: int):
    query = (
        select(User, Participation.status, Attendance.attended)
        .join(Participation, Participation.user_id == User.id)
        .outerjoin(
            Attendance,
            (Attendance.event_id == Participation.event_id)
            & (Attendance.user_id == Participation.user_id),
        )
        .where(
            Participation.event_id == event_id,
            Participation.status == ParticipationStatus.JOINED.value,
        )
        .order_by(Participation.joined_at)
    )
    return db.execute(query).all()


def create_with_creator_participation(db: Session, event: Event) -> Event:
    try:
        db.add(event)
        db.flush()
        db.add(
            Participation(
                event_id=event.id,
                user_id=event.creator_id,
                status=ParticipationStatus.JOINED.value,
            )
        )
        db.commit()
    except IntegrityError as error:
        db.rollback()
        raise ConflictError(
            "The change conflicts with existing data or a related record"
        ) from error
    except Exception:
        db.rollback()
        raise
    db.refresh(event)
    return event


def set_image(db: Session, event: Event, image: str) -> Event:
    event.image = image
    return add(db, event)
