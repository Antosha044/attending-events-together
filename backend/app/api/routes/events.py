from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.event import Event, EventStatus
from app.models.participation import Participation, ParticipationStatus
from app.models.user import User
from app.schemas.event import EventCreate, EventRead, EventUpdate
from app.services.crud import delete_record, get_or_404, save_or_conflict, update_fields

router = APIRouter(prefix="/events", tags=["events"])


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


@router.post("", response_model=EventRead, status_code=status.HTTP_201_CREATED)
def create_event(payload: EventCreate, db: Session = Depends(get_db)) -> Event:
    if db.get(User, payload.creator_id) is None:
        raise HTTPException(status_code=404, detail="Event creator was not found")
    event = Event(**payload.model_dump())
    return save_or_conflict(db, event)


@router.get("/{event_id}", response_model=EventRead)
def read_event(event_id: int, db: Session = Depends(get_db)) -> Event:
    return get_or_404(db, Event, event_id)


@router.patch("/{event_id}", response_model=EventRead)
def update_event(event_id: int, payload: EventUpdate, db: Session = Depends(get_db)) -> Event:
    event = get_or_404(db, Event, event_id)
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
def delete_event(event_id: int, db: Session = Depends(get_db)) -> Response:
    delete_record(db, get_or_404(db, Event, event_id))
    return Response(status_code=status.HTTP_204_NO_CONTENT)
