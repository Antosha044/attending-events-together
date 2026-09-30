from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.event import Event
from app.models.participation import Participation, ParticipationStatus
from app.models.user import User
from app.schemas.participation import ParticipationCreate, ParticipationRead, ParticipationUpdate
from app.services.crud import delete_record, get_or_404, save_or_conflict, update_fields
from app.services.participations import ensure_space

router = APIRouter(prefix="/participations", tags=["participations"])


@router.get("", response_model=list[ParticipationRead])
def list_participations(
    event_id: int | None = Query(default=None, gt=0),
    user_id: int | None = Query(default=None, gt=0),
    db: Session = Depends(get_db),
) -> list[Participation]:
    query = select(Participation).order_by(Participation.id)
    if event_id is not None:
        query = query.where(Participation.event_id == event_id)
    if user_id is not None:
        query = query.where(Participation.user_id == user_id)
    return list(db.scalars(query))


@router.post("", response_model=ParticipationRead, status_code=status.HTTP_201_CREATED)
def create_participation(payload: ParticipationCreate, db: Session = Depends(get_db)) -> Participation:
    event = get_or_404(db, Event, payload.event_id)
    get_or_404(db, User, payload.user_id)
    existing = db.scalar(select(Participation).where(
        Participation.event_id == payload.event_id,
        Participation.user_id == payload.user_id,
    ))
    if existing:
        raise HTTPException(status_code=409, detail="This user already has a participation record for the event")
    ensure_space(db, event)
    return save_or_conflict(db, Participation(**payload.model_dump()))


@router.get("/{participation_id}", response_model=ParticipationRead)
def read_participation(participation_id: int, db: Session = Depends(get_db)) -> Participation:
    return get_or_404(db, Participation, participation_id)


@router.patch("/{participation_id}", response_model=ParticipationRead)
def update_participation(participation_id: int, payload: ParticipationUpdate, db: Session = Depends(get_db)) -> Participation:
    participation = get_or_404(db, Participation, participation_id)
    if payload.status == ParticipationStatus.JOINED and participation.status != ParticipationStatus.JOINED:
        ensure_space(db, get_or_404(db, Event, participation.event_id), participation.id)
    return save_or_conflict(db, update_fields(participation, payload.model_dump()))


@router.delete("/{participation_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_participation(participation_id: int, db: Session = Depends(get_db)) -> Response:
    delete_record(db, get_or_404(db, Participation, participation_id))
    return Response(status_code=status.HTTP_204_NO_CONTENT)
