from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.security import get_current_user
from app.models.attendance import Attendance
from app.models.event import Event
from app.models.participation import Participation, ParticipationStatus
from app.models.user import User
from app.schemas.attendance import AttendanceCreate, AttendanceRead, AttendanceUpdate
from app.services.crud import delete_record, get_or_404, save_or_conflict, update_fields

router = APIRouter(prefix="/attendances", tags=["attendances"])


@router.get("", response_model=list[AttendanceRead])
def list_attendances(event_id: int | None = Query(default=None, gt=0), user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[Attendance]:
    query = select(Attendance).order_by(Attendance.id)
    if event_id is not None:
        query = query.where(Attendance.event_id == event_id)
    query = query.where(Attendance.user_id == user.id) if event_id is None else query.where(Attendance.event_id == event_id, Attendance.user_id == user.id)
    return list(db.scalars(query))


@router.put("", response_model=AttendanceRead)
def create_attendance(payload: AttendanceCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> Attendance:
    event = get_or_404(db, Event, payload.event_id)
    if event.creator_id != user.id:
        raise HTTPException(status_code=403, detail="Only the event creator can record attendance")
    if event.starts_at > datetime.now(timezone.utc):
        raise HTTPException(status_code=409, detail="Attendance can only be recorded after the event has ended")
    participation = db.scalar(select(Participation).where(
        Participation.event_id == payload.event_id,
        Participation.user_id == payload.user_id,
        Participation.status == ParticipationStatus.JOINED.value,
    ))
    if participation is None:
        raise HTTPException(status_code=404, detail="Joined participant not found for this event")
    attendance = db.scalar(select(Attendance).where(Attendance.event_id == payload.event_id, Attendance.user_id == payload.user_id))
    if attendance is None:
        attendance = Attendance(event_id=payload.event_id, user_id=payload.user_id, attended=payload.attended)
    else:
        attendance.attended = payload.attended
    return save_or_conflict(db, attendance)


@router.get("/{attendance_id}", response_model=AttendanceRead)
def read_attendance(attendance_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> Attendance:
    attendance = get_or_404(db, Attendance, attendance_id)
    if attendance.event.creator_id != user.id:
        if attendance.user_id != user.id or attendance.event.starts_at > datetime.now(timezone.utc):
            raise HTTPException(status_code=403, detail="Attendance is available to the event creator after the event")
    return attendance


@router.patch("/{attendance_id}", response_model=AttendanceRead)
def update_attendance(attendance_id: int, payload: AttendanceUpdate, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> Attendance:
    attendance = get_or_404(db, Attendance, attendance_id)
    if attendance.event.creator_id != user.id:
        raise HTTPException(status_code=403, detail="Only the event creator can update attendance")
    if attendance.event.starts_at > datetime.now(timezone.utc):
        raise HTTPException(status_code=409, detail="Attendance can only be updated after the event has ended")
    return save_or_conflict(db, update_fields(attendance, payload.model_dump()))


@router.delete("/{attendance_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_attendance(attendance_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> Response:
    attendance = get_or_404(db, Attendance, attendance_id)
    if attendance.event.creator_id != user.id:
        raise HTTPException(status_code=403, detail="Only the event creator can delete attendance")
    if attendance.event.starts_at > datetime.now(timezone.utc):
        raise HTTPException(status_code=409, detail="Attendance can only be changed after the event has ended")
    delete_record(db, attendance)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
