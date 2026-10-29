from pathlib import Path
from uuid import uuid4

from sqlalchemy.orm import Session

from app.core.exceptions import ApplicationError, ConflictError
from app.crud import base, participations
from app.crud import events as crud
from app.crud.participations import (
    joined_count as _joined_count,
)
from app.crud.participations import (
    joined_exists as _joined_exists,
)
from app.models.event import Event, EventStatus


def list_events(
    db: Session, status: EventStatus | None, search: str | None, offset: int, limit: int
):
    return crud.list_events(db, status, search, offset, limit)


def participating_events(db: Session, user_id: int):
    return crud.participating(db, user_id)


def participants(db: Session, event_id: int):
    return crud.participant_rows(db, event_id)


def joined(db: Session, event_id: int, user_id: int):
    return _joined_exists(db, event_id, user_id)


def get_event(db: Session, event_id: int):
    return base.get(db, Event, event_id)


def create_event(db: Session, values: dict, creator_id: int):
    return crud.create_with_creator_participation(
        db, Event(**values, creator_id=creator_id)
    )


def update_event(db: Session, event: Event, values: dict):
    return base.add(db, base.update(event, values))


def validate_capacity(db: Session, event: Event, capacity: int | None):
    if capacity is not None and capacity < _joined_count(db, event.id):
        raise ConflictError(
            "Capacity cannot be lower than the current number of participants"
        )


def delete_event(db: Session, event: Event):
    base.delete(db, event)


def save_image(
    db: Session, event: Event, directory: Path, content: bytes, extension: str
) -> Event:
    directory.mkdir(parents=True, exist_ok=True)
    filename = f"{uuid4().hex}.{extension}"
    destination = directory / filename
    previous_image = event.image
    try:
        destination.write_bytes(content)
        result = crud.set_image(db, event, f"/media/events/{filename}")
    except Exception:
        destination.unlink(missing_ok=True)
        raise
    if previous_image.startswith("/media/events/"):
        old_name = previous_image.removeprefix("/media/events/")
        if Path(old_name).name == old_name:
            (directory / old_name).unlink(missing_ok=True)
    return result


def upload_image(
    db: Session,
    event_id: int,
    user_id: int,
    directory: Path,
    content: bytes,
    extension: str,
) -> Event:
    event = base.get(db, Event, event_id)
    if event.creator_id != user_id:
        raise ApplicationError(403, "Only the event creator can change its image")
    return save_image(db, event, directory, content, extension)


def list_participants(db: Session, event_id: int, user_id: int):
    event = base.get(db, Event, event_id)
    if event.creator_id != user_id and not _joined_exists(db, event_id, user_id):
        raise ApplicationError(403, "Join this event to view its group")
    from datetime import datetime, timezone

    ended = event.starts_at <= datetime.now(timezone.utc)
    rows = crud.participant_rows(db, event_id)
    return [
        (member, status, attended if ended else None)
        for member, status, attended in rows
    ]


def update_owned_event(db: Session, event_id: int, user_id: int, values: dict):
    event = base.get(db, Event, event_id)
    if event.creator_id != user_id:
        raise ApplicationError(403, "Only the event creator can edit it")
    if "capacity" in values:
        validate_capacity(db, event, values["capacity"])
    return update_event(db, event, values)


def delete_owned_event(db: Session, event_id: int, user_id: int):
    event = base.get(db, Event, event_id)
    if event.creator_id != user_id:
        raise ApplicationError(403, "Only the event creator can delete it")
    delete_event(db, event)
