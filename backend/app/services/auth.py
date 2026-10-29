from datetime import UTC, datetime, timedelta

from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.exceptions import ApplicationError
from app.core.security import (
    create_access_token,
    hash_password,
    issue_refresh_token,
    token_digest,
    verify_password,
)
from app.crud import auth as crud
from app.crud import base, users
from app.models.refresh_token import RefreshToken
from app.models.user import User
from app.schemas.auth import TokenPair


def make_token_pair(db: Session, user: User) -> TokenPair:
    access_token, expires = create_access_token(user.id)
    refresh_token = issue_refresh_token()
    crud.add_refresh_token(
        db,
        RefreshToken(
            user_id=user.id,
            token_hash=token_digest(refresh_token),
            expires_at=datetime.now(UTC)
            + timedelta(days=get_settings().refresh_token_days),
        ),
    )
    crud.save(db)
    return TokenPair(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=int((expires - datetime.now(UTC)).total_seconds()),
        user=user,
    )


def register(db: Session, payload):
    user = User(
        display_name=payload.display_name.strip(),
        email=payload.email.lower(),
        city=payload.city.strip(),
        password_hash=hash_password(payload.password),
    )
    return make_token_pair(db, base.add(db, user))


def login(db: Session, email: str, password: str):
    user = users.get_by_email(db, email.lower())
    if user is None or not verify_password(password, user.password_hash):
        raise ApplicationError(401, "Неверная почта или пароль")
    return make_token_pair(db, user)


def refresh(db: Session, raw_token: str):
    record = crud.get_refresh_token(db, token_digest(raw_token), lock=True)
    now = datetime.now(UTC)
    if record is None or record.revoked_at is not None or record.expires_at <= now:
        raise ApplicationError(401, "Refresh token is invalid, expired or revoked")
    user = crud.revoke_and_get_user(db, record, now)
    if user is None:
        crud.save(db)
        raise ApplicationError(401, "User no longer exists")
    return make_token_pair(db, user)


def logout(db: Session, raw_token: str):
    record = crud.get_refresh_token(db, token_digest(raw_token))
    if record is not None and record.revoked_at is None:
        crud.revoke(db, record, datetime.now(UTC))


def update_me(db: Session, user: User, values: dict):
    return base.add(db, base.update(user, values))
