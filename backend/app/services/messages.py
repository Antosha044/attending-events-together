from sqlalchemy.orm import Session

from app.core.exceptions import ApplicationError
from app.crud import base, participations
from app.crud import messages as crud
from app.models.event import Event
from app.models.message import Message


def list_messages(db: Session, event_id: int):
    return crud.list_for_event(db, event_id)


def get_event(db: Session, event_id: int):
    return base.get(db, Event, event_id)


def is_joined(db: Session, event_id: int, user_id: int):
    return participations.joined_exists(db, event_id, user_id)


def get_message(db: Session, message_id: int):
    return base.get(db, Message, message_id)


def create_message(db: Session, event_id: int, user_id: int, body: str):
    base.get(db, Event, event_id)
    if not participations.joined_exists(db, event_id, user_id):
        raise ApplicationError(
            409, "The message author must be a joined event participant"
        )
    return base.add(db, Message(event_id=event_id, author_id=user_id, body=body))


def update_message(db: Session, record: Message, values: dict):
    return base.add(db, base.update(record, values))


def delete_message(db: Session, record: Message):
    base.delete(db, record)


def list_for_member(db: Session, event_id: int, user_id: int):
    base.get(db, Event, event_id)
    if not participations.joined_exists(db, event_id, user_id):
        raise ApplicationError(403, "Join this event to view its group chat")
    return list_messages(db, event_id)


def get_for_member(db: Session, message_id: int, user_id: int):
    record = get_message(db, message_id)
    if not participations.joined_exists(db, record.event_id, user_id):
        raise ApplicationError(403, "Join this event to view its group chat")
    return record


def update_owned(db: Session, message_id: int, user_id: int, values: dict):
    record = get_message(db, message_id)
    if record.author_id != user_id:
        raise ApplicationError(403, "You can only edit your own messages")
    return update_message(db, record, values)


def delete_owned(db: Session, message_id: int, user_id: int):
    record = get_message(db, message_id)
    if record.author_id != user_id:
        raise ApplicationError(403, "You can only delete your own messages")
    delete_message(db, record)
