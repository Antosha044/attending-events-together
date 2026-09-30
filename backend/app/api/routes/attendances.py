from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.attendance import Attendance
from app.models.event import Event
from app.models.participation import Participation, ParticipationStatus
from app.models.user import User
from app.schemas.attendance import AttendanceCreate, AttendanceRead, AttendanceUpdate
from app.services.crud import delete_record, get_or_404, save_or_conflict, update_fields

router = APIRouter(prefix="/attendances", tags=["attendances"])


@router.get("", response_model=list[AttendanceRead])
def list_attendances(event_id: int | None = Query(default=None, gt=0), user_id: int | None = Query(default=None, gt=0), db: Session = Depends(get_db)) -> list[Attendance]:
    query = select(Attendance).order_by(Attendance.id)
    if event_id is not None:
        query = query.where(Attendance.event_id == event_id)
    if user_id is not None:
        query = query.where(Attendance.user_id == user_id)
    return list(db.scalars(query))


@router.post("", response_model=AttendanceRead, status_code=status.HTTP_201_CREATED)
def create_attendance(payload: AttendanceCreate, db: Session = Depends(get_db)) -> Attendance:
    get_or_404(db, Event, payload.event_id)
    get_or_404(db, User, payload.user_id)
    participation = db.scalar(select(Participation).where(
        Participation.event_id == payload.event_id,
        Participation.user_id == payload.user_id,
        Participation.status == ParticipationStatus.JOINED.value,
    ))
    if participation is None:
        raise HTTPException(status_code=409, detail="Attendance can only be recorded for a joined participant")
    return save_or_conflict(db, Attendance(**payload.model_dump()))


@router.get("/{attendance_id}", response_model=AttendanceRead)
def read_attendance(attendance_id: int, db: Session = Depends(get_db)) -> Attendance:
    return get_or_404(db, Attendance, attendance_id)


@router.patch("/{attendance_id}", response_model=AttendanceRead)
def update_attendance(attendance_id: int, payload: AttendanceUpdate, db: Session = Depends(get_db)) -> Attendance:
    attendance = get_or_404(db, Attendance, attendance_id)
    return save_or_conflict(db, update_fields(attendance, payload.model_dump()))


@router.delete("/{attendance_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_attendance(attendance_id: int, db: Session = Depends(get_db)) -> Response:
    delete_record(db, get_or_404(db, Attendance, attendance_id))
    return Response(status_code=status.HTTP_204_NO_CONTENT)
