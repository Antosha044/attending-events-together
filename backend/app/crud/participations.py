from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.participation import Participation, ParticipationStatus


def get_for_event_user(
    db: Session, event_id: int, user_id: int
) -> Participation | None:
    return db.scalar(
        select(Participation).where(
            Participation.event_id == event_id, Participation.user_id == user_id
        )
    )


def joined_exists(db: Session, event_id: int, user_id: int) -> bool:
    return (
        db.scalar(
            select(Participation.id).where(
                Participation.event_id == event_id,
                Participation.user_id == user_id,
                Participation.status == ParticipationStatus.JOINED.value,
            )
        )
        is not None
    )


def joined_count(db: Session, event_id: int, exclude_id: int | None = None) -> int:
    query = select(func.count(Participation.id)).where(
        Participation.event_id == event_id,
        Participation.status == ParticipationStatus.JOINED.value,
    )
    if exclude_id is not None:
        query = query.where(Participation.id != exclude_id)
    return db.scalar(query) or 0


def list_participations(
    db: Session, user_id: int, event_id: int | None = None
) -> list[Participation]:
    query = select(Participation).order_by(Participation.id)
    if event_id is not None:
        query = query.where(
            Participation.event_id == event_id,
            Participation.status == ParticipationStatus.JOINED.value,
        )
    else:
        query = query.where(Participation.user_id == user_id)
    return list(db.scalars(query))
