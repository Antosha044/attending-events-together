from sqlalchemy.orm import Session

from app.core.exceptions import ApplicationError
from app.crud import base
from app.crud import participations as crud
from app.crud.participations import joined_exists
from app.models.event import Event
from app.models.participation import Participation, ParticipationStatus


def ensure_space(
    db: Session, event: Event, current_participation_id: int | None = None
) -> None:
    if crud.joined_count(db, event.id, current_participation_id) >= event.capacity:
        raise ApplicationError(409, "The event has reached its participant capacity")


def list_participations(db: Session, user_id: int, event_id: int | None):
    return crud.list_participations(db, user_id, event_id)


def get_event(db: Session, event_id: int):
    return base.get(db, Event, event_id)


def is_joined(db: Session, event_id: int, user_id: int):
    return joined_exists(db, event_id, user_id)


def get_participation(db: Session, participation_id: int):
    return base.get(db, Participation, participation_id)


def create_participation(db: Session, event_id: int, user_id: int):
    event = base.get(db, Event, event_id)
    existing = crud.get_for_event_user(db, event_id, user_id)
    if existing:
        if existing.status == ParticipationStatus.CANCELLED.value:
            ensure_space(db, event)
            existing.status = ParticipationStatus.JOINED.value
            return base.add(db, existing)
        raise ApplicationError(
            409, "This user already has a participation record for the event"
        )
    ensure_space(db, event)
    return base.add(db, Participation(event_id=event_id, user_id=user_id))


def update_participation(db: Session, record: Participation, values: dict):
    return base.add(db, base.update(record, values))


def delete_participation(db: Session, record: Participation):
    base.delete(db, record)


def list_visible(db: Session, event_id: int | None, user_id: int):
    if event_id is not None:
        event = get_event(db, event_id)
        if event.creator_id != user_id and not is_joined(db, event_id, user_id):
            raise ApplicationError(403, "Join this event to view its participants")
    return list_participations(db, user_id, event_id)


def get_owned(db: Session, participation_id: int, user_id: int, action: str = "view"):
    record = get_participation(db, participation_id)
    if record.user_id != user_id:
        verb = {"view": "view", "change": "change", "remove": "remove"}[action]
        raise ApplicationError(403, f"You can only {verb} your own participation")
    return record


def update_owned(db: Session, participation_id: int, user_id: int, values: dict):
    record = get_owned(db, participation_id, user_id, "change")
    if (
        values.get("status") == ParticipationStatus.JOINED
        and record.status != ParticipationStatus.JOINED
    ):
        ensure_space(db, get_event(db, record.event_id), record.id)
    return update_participation(db, record, values)


def delete_owned(db: Session, participation_id: int, user_id: int):
    delete_participation(db, get_owned(db, participation_id, user_id, "remove"))
