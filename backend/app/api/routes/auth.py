from datetime import UTC, datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.security import create_access_token, get_current_user, hash_password, issue_refresh_token, token_digest, verify_password
from app.db.session import get_db
from app.models.refresh_token import RefreshToken
from app.models.user import User
from app.schemas.auth import Credentials, RefreshRequest, RegisterRequest, TokenPair
from app.schemas.user import UserRead, UserUpdate
from app.services.crud import save_or_conflict, update_fields

router = APIRouter(prefix="/auth", tags=["authentication"])


def make_token_pair(db: Session, user: User) -> TokenPair:
    access_token, expires = create_access_token(user.id)
    refresh_token = issue_refresh_token()
    db.add(RefreshToken(
        user_id=user.id,
        token_hash=token_digest(refresh_token),
        expires_at=datetime.now(UTC) + timedelta(days=get_settings().refresh_token_days),
    ))
    db.commit()
    return TokenPair(access_token=access_token, refresh_token=refresh_token, expires_in=int((expires - datetime.now(UTC)).total_seconds()), user=user)


@router.post("/register", response_model=TokenPair, status_code=201)
def register(payload: RegisterRequest, db: Session = Depends(get_db)) -> TokenPair:
    user = User(display_name=payload.display_name.strip(), email=payload.email.lower(), city=payload.city.strip(), password_hash=hash_password(payload.password))
    user = save_or_conflict(db, user)
    return make_token_pair(db, user)


@router.post("/login", response_model=TokenPair)
def login(payload: Credentials, db: Session = Depends(get_db)) -> TokenPair:
    user = db.scalar(select(User).where(User.email == payload.email.lower()))
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Неверная почта или пароль")
    return make_token_pair(db, user)


@router.post("/refresh", response_model=TokenPair)
def refresh(payload: RefreshRequest, db: Session = Depends(get_db)) -> TokenPair:
    record = db.scalar(select(RefreshToken).where(RefreshToken.token_hash == token_digest(payload.refresh_token)).with_for_update())
    now = datetime.now(UTC)
    if record is None or record.revoked_at is not None or record.expires_at <= now:
        raise HTTPException(status_code=401, detail="Refresh token is invalid, expired or revoked")
    record.revoked_at = now
    user = db.get(User, record.user_id)
    if user is None:
        db.commit()
        raise HTTPException(status_code=401, detail="User no longer exists")
    return make_token_pair(db, user)


@router.post("/logout", status_code=204)
def logout(payload: RefreshRequest, db: Session = Depends(get_db)) -> Response:
    record = db.scalar(select(RefreshToken).where(RefreshToken.token_hash == token_digest(payload.refresh_token)))
    if record is not None and record.revoked_at is None:
        record.revoked_at = datetime.now(UTC)
        db.commit()
    return Response(status_code=204)


@router.get("/me", response_model=UserRead)
def me(user: User = Depends(get_current_user)) -> User:
    return user


@router.patch("/me", response_model=UserRead)
def update_me(payload: UserUpdate, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> User:
    return save_or_conflict(db, update_fields(user, payload.model_dump(exclude_unset=True)))
