from sqlalchemy.orm import Session

from app.crud import base
from app.crud import users as crud
from app.models.user import User


def list_users(db: Session):
    return crud.list_users(db)


def get_user(db: Session, user_id: int):
    return base.get(db, User, user_id)


def create_user(db: Session, values: dict):
    return base.add(db, User(**values))


def update_user(db: Session, user: User, values: dict):
    return base.add(db, base.update(user, values))


def delete_user(db: Session, user: User):
    base.delete(db, user)
