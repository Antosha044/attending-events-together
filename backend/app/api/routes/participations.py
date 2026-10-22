from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.security import get_current_user
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
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[Participation]:
    query = select(Participation).order_by(Participation.id)
    if event_id is not None:
        query = query.where(Participation.event_id == event_id)
    if event_id is not None:
        event = get_or_404(db, Event, event_id)
        if event.creator_id != user.id and db.scalar(select(Participation.id).where(
            Participation.event_id == event_id,
            Participation.user_id == user.id,
            Participation.status == ParticipationStatus.JOINED.value,
        )) is None:
            raise HTTPException(status_code=403, detail="Join this event to view its participants")
    query = query.where(Participation.user_id == user.id) if event_id is None else query.where(Participation.status == ParticipationStatus.JOINED.value)
    return list(db.scalars(query))


@router.post("", response_model=ParticipationRead, status_code=status.HTTP_201_CREATED)
def create_participation(payload: ParticipationCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> Participation:
    event = get_or_404(db, Event, payload.event_id)
    existing = db.scalar(select(Participation).where(
        Participation.event_id == payload.event_id,
        Participation.user_id == user.id,
    ))
    if existing:
        if existing.status == ParticipationStatus.CANCELLED.value:
            ensure_space(db, event)
            existing.status = ParticipationStatus.JOINED.value
            return save_or_conflict(db, existing)
        raise HTTPException(status_code=409, detail="This user already has a participation record for the event")
    ensure_space(db, event)
    return save_or_conflict(db, Participation(event_id=event.id, user_id=user.id))


@router.get("/{participation_id}", response_model=ParticipationRead)
def read_participation(participation_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> Participation:
    participation = get_or_404(db, Participation, participation_id)
    if participation.user_id != user.id:
        raise HTTPException(status_code=403, detail="You can only view your own participation")
    return participation


@router.patch("/{participation_id}", response_model=ParticipationRead)
def update_participation(participation_id: int, payload: ParticipationUpdate, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> Participation:
    participation = get_or_404(db, Participation, participation_id)
    if participation.user_id != user.id:
        raise HTTPException(status_code=403, detail="You can only change your own participation")
    if payload.status == ParticipationStatus.JOINED and participation.status != ParticipationStatus.JOINED:
        ensure_space(db, get_or_404(db, Event, participation.event_id), participation.id)
    return save_or_conflict(db, update_fields(participation, payload.model_dump()))


@router.delete("/{participation_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_participation(participation_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> Response:
    participation = get_or_404(db, Participation, participation_id)
    if participation.user_id != user.id:
        raise HTTPException(status_code=403, detail="You can only remove your own participation")
    delete_record(db, participation)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
