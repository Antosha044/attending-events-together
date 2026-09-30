from fastapi import APIRouter, Depends, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserRead, UserUpdate
from app.services.crud import delete_record, get_or_404, save_or_conflict, update_fields

router = APIRouter(prefix="/users", tags=["users"])


@router.get("", response_model=list[UserRead])
def list_users(db: Session = Depends(get_db)) -> list[User]:
    return list(db.scalars(select(User).order_by(User.id)))


@router.post("", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def create_user(payload: UserCreate, db: Session = Depends(get_db)) -> User:
    user = User(**payload.model_dump())
    return save_or_conflict(db, user)


@router.get("/{user_id}", response_model=UserRead)
def read_user(user_id: int, db: Session = Depends(get_db)) -> User:
    return get_or_404(db, User, user_id)


@router.patch("/{user_id}", response_model=UserRead)
def update_user(user_id: int, payload: UserUpdate, db: Session = Depends(get_db)) -> User:
    user = get_or_404(db, User, user_id)
    return save_or_conflict(db, update_fields(user, payload.model_dump(exclude_unset=True)))


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: int, db: Session = Depends(get_db)) -> Response:
    delete_record(db, get_or_404(db, User, user_id))
    return Response(status_code=status.HTTP_204_NO_CONTENT)
