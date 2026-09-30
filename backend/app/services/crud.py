from typing import Any, TypeVar

from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.db.base import Base

Model = TypeVar("Model", bound=Base)


def get_or_404(db: Session, model: type[Model], record_id: int) -> Model:
    record = db.get(model, record_id)
    if record is None:
        raise HTTPException(status_code=404, detail=f"{model.__name__} with id {record_id} was not found")
    return record


def save_or_conflict(db: Session, record: Model) -> Model:
    db.add(record)
    try:
        db.commit()
    except IntegrityError as error:
        db.rollback()
        raise HTTPException(status_code=409, detail="The change conflicts with existing data or a related record") from error
    db.refresh(record)
    return record


def update_fields(record: Model, values: dict[str, Any]) -> Model:
    for key, value in values.items():
        setattr(record, key, value)
    return record


def delete_record(db: Session, record: Model) -> None:
    db.delete(record)
    try:
        db.commit()
    except IntegrityError as error:
        db.rollback()
        raise HTTPException(status_code=409, detail="This record is still referenced by other data") from error
