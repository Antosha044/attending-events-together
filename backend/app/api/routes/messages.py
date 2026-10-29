from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.message import MessageCreate, MessageRead, MessageUpdate
from app.services import messages as service

router = APIRouter(prefix="/messages", tags=["messages"])


@router.get("", response_model=list[MessageRead])
def list_messages(
    event_id: int = Query(gt=0),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return service.list_for_member(db, event_id, user.id)


@router.post("", response_model=MessageRead, status_code=status.HTTP_201_CREATED)
def create_message(
    payload: MessageCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return service.create_message(db, payload.event_id, user.id, payload.body)


@router.get("/{message_id}", response_model=MessageRead)
def read_message(
    message_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return service.get_for_member(db, message_id, user.id)


@router.patch("/{message_id}", response_model=MessageRead)
def update_message(
    message_id: int,
    payload: MessageUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return service.update_owned(db, message_id, user.id, payload.model_dump())


@router.delete("/{message_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_message(
    message_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Response:
    service.delete_owned(db, message_id, user.id)
    return Response(status_code=204)
