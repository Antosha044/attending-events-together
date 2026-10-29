from typing import Any, TypeVar

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.exceptions import ConflictError, NotFoundError
from app.db.base import Base

Model = TypeVar("Model", bound=Base)


def get(db: Session, model: type[Model], record_id: int) -> Model:
    record = db.get(model, record_id)
    if record is None:
        raise NotFoundError(f"{model.__name__} with id {record_id} was not found")
    return record


def add(
    db: Session,
    record: Model,
    *,
    conflict_detail: str = "The change conflicts with existing data or a related record",
) -> Model:
    db.add(record)
    try:
        db.commit()
    except IntegrityError as error:
        db.rollback()
        raise ConflictError(conflict_detail) from error
    except Exception:
        db.rollback()
        raise
    db.refresh(record)
    return record


def update(record: Model, values: dict[str, Any]) -> Model:
    for key, value in values.items():
        setattr(record, key, value)
    return record


def delete(db: Session, record: Model) -> None:
    db.delete(record)
    try:
        db.commit()
    except IntegrityError as error:
        db.rollback()
        raise ConflictError("This record is still referenced by other data") from error
    except Exception:
        db.rollback()
        raise
