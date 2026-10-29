from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import Credentials, RefreshRequest, RegisterRequest, TokenPair
from app.schemas.user import UserRead, UserUpdate
from app.services import auth as service

router = APIRouter(prefix="/auth", tags=["authentication"])


@router.post("/register", response_model=TokenPair, status_code=201)
def register(payload: RegisterRequest, db: Session = Depends(get_db)) -> TokenPair:
    return service.register(db, payload)


@router.post("/login", response_model=TokenPair)
def login(payload: Credentials, db: Session = Depends(get_db)) -> TokenPair:
    return service.login(db, payload.email, payload.password)


@router.post("/refresh", response_model=TokenPair)
def refresh(payload: RefreshRequest, db: Session = Depends(get_db)) -> TokenPair:
    return service.refresh(db, payload.refresh_token)


@router.post("/logout", status_code=204)
def logout(payload: RefreshRequest, db: Session = Depends(get_db)) -> Response:
    service.logout(db, payload.refresh_token)
    return Response(status_code=204)


@router.get("/me", response_model=UserRead)
def me(user: User = Depends(get_current_user)) -> User:
    return user


@router.patch("/me", response_model=UserRead)
def update_me(
    payload: UserUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> User:
    return service.update_me(db, user, payload.model_dump(exclude_unset=True))
