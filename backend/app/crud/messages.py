from sqlalchemy import select
from sqlalchemy.orm import Session

from app.crud.participations import joined_exists
from app.models.message import Message


def is_joined(db: Session, event_id: int, user_id: int) -> bool:
    return joined_exists(db, event_id, user_id)


def list_for_event(db: Session, event_id: int) -> list[Message]:
    return list(
        db.scalars(
            select(Message)
            .where(Message.event_id == event_id)
            .order_by(Message.sent_at, Message.id)
        )
    )
