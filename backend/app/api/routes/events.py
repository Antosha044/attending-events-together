from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.security import get_current_user
from app.models.event import Event, EventStatus
from app.models.participation import Participation, ParticipationStatus
from app.models.user import User
from app.schemas.event import EventCreate, EventRead, EventUpdate
from app.schemas.auth import ParticipantRead
from app.services.crud import delete_record, get_or_404, save_or_conflict, update_fields

router = APIRouter(prefix="/events", tags=["events"])


@router.get("/{event_id}/participants", response_model=list[ParticipantRead])
def list_event_participants(event_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[ParticipantRead]:
    event = get_or_404(db, Event, event_id)
    if user.id != event.creator_id and db.scalar(select(Participation.id).where(
        Participation.event_id == event_id,
        Participation.user_id == user.id,
        Participation.status == ParticipationStatus.JOINED.value,
    )) is None:
        raise HTTPException(status_code=403, detail="Join this event to view its group")
    rows = db.execute(select(User, Participation.status).join(Participation, Participation.user_id == User.id).where(
        Participation.event_id == event_id,
        Participation.status == ParticipationStatus.JOINED.value,
    ).order_by(Participation.joined_at)).all()
    return [ParticipantRead(id=member.id, display_name=member.display_name, status=participation_status) for member, participation_status in rows]


@router.get("", response_model=list[EventRead])
def list_events(
    status_filter: EventStatus | None = Query(default=None, alias="status"),
    search: str | None = Query(default=None, min_length=1, max_length=100),
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=100),
    db: Session = Depends(get_db),
) -> list[Event]:
    query = select(Event).order_by(Event.starts_at, Event.id).offset(offset).limit(limit)
    if status_filter:
        query = query.where(Event.status == status_filter.value)
    if search:
        query = query.where(Event.title.ilike(f"%{search}%"))
    return list(db.scalars(query))


@router.get("/participating", response_model=list[EventRead])
def list_participating_events(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[Event]:
    query = (
        select(Event)
        .join(Participation, Participation.event_id == Event.id)
        .where(
            Participation.user_id == user.id,
            Participation.status == ParticipationStatus.JOINED.value,
        )
        .order_by(Event.starts_at, Event.id)
    )
    return list(db.scalars(query))


@router.post("", response_model=EventRead, status_code=status.HTTP_201_CREATED)
def create_event(payload: EventCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> Event:
    values = payload.model_dump()
    event = Event(**values, creator_id=user.id)
    event = save_or_conflict(db, event)
    db.add(Participation(event_id=event.id, user_id=user.id, status=ParticipationStatus.JOINED.value))
    db.commit()
    db.refresh(event)
    return event


@router.get("/{event_id}", response_model=EventRead)
def read_event(event_id: int, db: Session = Depends(get_db)) -> Event:
    return get_or_404(db, Event, event_id)


@router.patch("/{event_id}", response_model=EventRead)
def update_event(event_id: int, payload: EventUpdate, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> Event:
    event = get_or_404(db, Event, event_id)
    if event.creator_id != user.id:
        raise HTTPException(status_code=403, detail="Only the event creator can edit it")
    changes = payload.model_dump(exclude_unset=True)
    if "capacity" in changes:
        joined = db.scalar(select(func.count(Participation.id)).where(
            Participation.event_id == event.id,
            Participation.status == ParticipationStatus.JOINED.value,
        )) or 0
        if changes["capacity"] is not None and changes["capacity"] < joined:
            raise HTTPException(status_code=409, detail="Capacity cannot be lower than the current number of participants")
    return save_or_conflict(db, update_fields(event, changes))


@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(event_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> Response:
    event = get_or_404(db, Event, event_id)
    if event.creator_id != user.id:
        raise HTTPException(status_code=403, detail="Only the event creator can delete it")
    delete_record(db, event)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
