from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.participation import (
    ParticipationCreate,
    ParticipationRead,
    ParticipationUpdate,
)
from app.services import participations as service

router = APIRouter(prefix="/participations", tags=["participations"])


@router.get("", response_model=list[ParticipationRead])
def list_participations(
    event_id: int | None = Query(default=None, gt=0),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return service.list_visible(db, event_id, user.id)


@router.post("", response_model=ParticipationRead, status_code=status.HTTP_201_CREATED)
def create_participation(
    payload: ParticipationCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return service.create_participation(db, payload.event_id, user.id)


@router.get("/{participation_id}", response_model=ParticipationRead)
def read_participation(
    participation_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return service.get_owned(db, participation_id, user.id)


@router.patch("/{participation_id}", response_model=ParticipationRead)
def update_participation(
    participation_id: int,
    payload: ParticipationUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return service.update_owned(db, participation_id, user.id, payload.model_dump())


@router.delete("/{participation_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_participation(
    participation_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Response:
    service.delete_owned(db, participation_id, user.id)
    return Response(status_code=204)
