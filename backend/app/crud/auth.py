from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.exceptions import ConflictError
from app.models.refresh_token import RefreshToken
from app.models.user import User


def get_refresh_token(
    db: Session, digest: str, *, lock: bool = False
) -> RefreshToken | None:
    query = select(RefreshToken).where(RefreshToken.token_hash == digest)
    if lock:
        query = query.with_for_update()
    return db.scalar(query)


def save(db: Session) -> None:
    try:
        db.commit()
    except IntegrityError as error:
        db.rollback()
        raise ConflictError(
            "The change conflicts with existing data or a related record"
        ) from error
    except Exception:
        db.rollback()
        raise


def get_user(db: Session, user_id: int) -> User | None:
    return db.get(User, user_id)


def add_refresh_token(db: Session, record: RefreshToken) -> None:
    db.add(record)


def revoke(db: Session, record: RefreshToken, revoked_at) -> None:
    record.revoked_at = revoked_at
    save(db)


def revoke_and_get_user(db: Session, record: RefreshToken, revoked_at) -> User | None:
    record.revoked_at = revoked_at
    return db.get(User, record.user_id)
