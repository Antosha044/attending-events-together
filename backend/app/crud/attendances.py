from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.attendance import Attendance


def list_for_user(
    db: Session, user_id: int, event_id: int | None = None
) -> list[Attendance]:
    query = select(Attendance).where(Attendance.user_id == user_id)
    if event_id is not None:
        query = query.where(Attendance.event_id == event_id)
    return list(db.scalars(query.order_by(Attendance.id)))


def find_for_event_user(db: Session, event_id: int, user_id: int) -> Attendance | None:
    return db.scalar(
        select(Attendance).where(
            Attendance.event_id == event_id, Attendance.user_id == user_id
        )
    )
