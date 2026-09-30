from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.event import Event
from app.models.message import Message
from app.models.participation import Participation, ParticipationStatus
from app.models.user import User
from app.schemas.message import MessageCreate, MessageRead, MessageUpdate
from app.services.crud import delete_record, get_or_404, save_or_conflict, update_fields

router = APIRouter(prefix="/messages", tags=["messages"])


@router.get("", response_model=list[MessageRead])
def list_messages(event_id: int = Query(gt=0), db: Session = Depends(get_db)) -> list[Message]:
    get_or_404(db, Event, event_id)
    return list(db.scalars(select(Message).where(Message.event_id == event_id).order_by(Message.sent_at, Message.id)))


@router.post("", response_model=MessageRead, status_code=status.HTTP_201_CREATED)
def create_message(payload: MessageCreate, db: Session = Depends(get_db)) -> Message:
    get_or_404(db, Event, payload.event_id)
    get_or_404(db, User, payload.author_id)
    participation = db.scalar(select(Participation).where(
        Participation.event_id == payload.event_id,
        Participation.user_id == payload.author_id,
        Participation.status == ParticipationStatus.JOINED.value,
    ))
    if participation is None:
        raise HTTPException(status_code=409, detail="The message author must be a joined event participant")
    return save_or_conflict(db, Message(**payload.model_dump()))


@router.get("/{message_id}", response_model=MessageRead)
def read_message(message_id: int, db: Session = Depends(get_db)) -> Message:
    return get_or_404(db, Message, message_id)


@router.patch("/{message_id}", response_model=MessageRead)
def update_message(message_id: int, payload: MessageUpdate, db: Session = Depends(get_db)) -> Message:
    message = get_or_404(db, Message, message_id)
    return save_or_conflict(db, update_fields(message, payload.model_dump()))


@router.delete("/{message_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_message(message_id: int, db: Session = Depends(get_db)) -> Response:
    delete_record(db, get_or_404(db, Message, message_id))
    return Response(status_code=status.HTTP_204_NO_CONTENT)
