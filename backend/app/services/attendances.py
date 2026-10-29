from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.core.exceptions import ApplicationError, ConflictError, NotFoundError
from app.crud import attendances as crud
from app.crud import base
from app.crud.participations import joined_exists
from app.models.attendance import Attendance
from app.models.event import Event


def list_attendances(db: Session, user_id: int, event_id: int | None):
    return crud.list_for_user(db, user_id, event_id)


def get_event(db: Session, event_id: int):
    return base.get(db, Event, event_id)


def get_attendance(db: Session, attendance_id: int):
    return base.get(db, Attendance, attendance_id)


def create_attendance(db: Session, event_id: int, user_id: int, attended: bool):
    event = base.get(db, Event, event_id)
    if event.starts_at > datetime.now(timezone.utc):
        raise ConflictError("Attendance can only be recorded after the event has ended")
    if not joined_exists(db, event_id, user_id):
        raise NotFoundError("Joined participant not found for this event")
    record = crud.find_for_event_user(db, event_id, user_id)
    if record is None:
        record = Attendance(event_id=event_id, user_id=user_id, attended=attended)
    else:
        record.attended = attended
    return base.add(db, record)


def update_attendance(db: Session, record: Attendance, values: dict):
    return base.add(db, base.update(record, values))


def delete_attendance(db: Session, record: Attendance):
    base.delete(db, record)


def record_attendance(
    db: Session, event_id: int, target_user_id: int, actor_id: int, attended: bool
):
    event = base.get(db, Event, event_id)
    if event.creator_id != actor_id:
        raise ApplicationError(403, "Only the event creator can record attendance")
    if event.starts_at > datetime.now(timezone.utc):
        raise ConflictError("Attendance can only be recorded after the event has ended")
    return create_attendance(db, event_id, target_user_id, attended)


def read_for_user(db: Session, attendance_id: int, user_id: int):
    record = get_attendance(db, attendance_id)
    if record.event.creator_id != user_id and (
        record.user_id != user_id or record.event.starts_at > datetime.now(timezone.utc)
    ):
        raise ApplicationError(
            403, "Attendance is available to the event creator after the event"
        )
    return record


def modify_owned(db: Session, attendance_id: int, user_id: int, values: dict):
    record = get_attendance(db, attendance_id)
    if record.event.creator_id != user_id:
        raise ApplicationError(403, "Only the event creator can update attendance")
    if record.event.starts_at > datetime.now(timezone.utc):
        raise ConflictError("Attendance can only be updated after the event has ended")
    return update_attendance(db, record, values)


def delete_owned(db: Session, attendance_id: int, user_id: int):
    record = get_attendance(db, attendance_id)
    if record.event.creator_id != user_id:
        raise ApplicationError(403, "Only the event creator can delete attendance")
    if record.event.starts_at > datetime.now(timezone.utc):
        raise ConflictError("Attendance can only be changed after the event has ended")
    delete_attendance(db, record)
