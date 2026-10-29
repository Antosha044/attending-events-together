from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.attendance import AttendanceCreate, AttendanceRead, AttendanceUpdate
from app.services import attendances as service

router = APIRouter(prefix="/attendances", tags=["attendances"])


@router.get("", response_model=list[AttendanceRead])
def list_attendances(
    event_id: int | None = Query(default=None, gt=0),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return service.list_attendances(db, user.id, event_id)


@router.put("", response_model=AttendanceRead)
def create_attendance(
    payload: AttendanceCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return service.record_attendance(
        db, payload.event_id, payload.user_id, user.id, payload.attended
    )


@router.get("/{attendance_id}", response_model=AttendanceRead)
def read_attendance(
    attendance_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return service.read_for_user(db, attendance_id, user.id)


@router.patch("/{attendance_id}", response_model=AttendanceRead)
def update_attendance(
    attendance_id: int,
    payload: AttendanceUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return service.modify_owned(db, attendance_id, user.id, payload.model_dump())


@router.delete("/{attendance_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_attendance(
    attendance_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Response:
    service.delete_owned(db, attendance_id, user.id)
    return Response(status_code=204)
