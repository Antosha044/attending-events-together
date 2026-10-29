from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response, status
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.security import get_current_user
from app.db.session import get_db
from app.models.event import Event, EventStatus
from app.models.user import User
from app.schemas.auth import ParticipantRead
from app.schemas.event import EventCreate, EventRead, EventUpdate
from app.services import events as service

router = APIRouter(prefix="/events", tags=["events"])
IMAGE_TYPES = {
    "image/jpeg": ("jpg", lambda data: data.startswith(b"\xff\xd8\xff")),
    "image/png": ("png", lambda data: data.startswith(b"\x89PNG\r\n\x1a\n")),
    "image/webp": (
        "webp",
        lambda data: len(data) >= 12 and data[:4] == b"RIFF" and data[8:12] == b"WEBP",
    ),
}
MAX_IMAGE_SIZE = 5 * 1024 * 1024


@router.put("/{event_id}/image", response_model=EventRead)
async def upload_event_image(
    event_id: int,
    request: Request,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Event:
    media_type = request.headers.get("content-type", "").split(";", 1)[0].lower()
    image_type = IMAGE_TYPES.get(media_type)
    if image_type is None:
        raise HTTPException(status_code=415, detail="Upload a JPEG, PNG, or WebP image")
    content = await request.body()
    if not content or len(content) > MAX_IMAGE_SIZE:
        raise HTTPException(
            status_code=413 if content else 400,
            detail="Image must be between 1 byte and 5 MB",
        )
    extension, matches_signature = image_type
    if not matches_signature(content):
        raise HTTPException(
            status_code=415, detail="The file contents do not match the image type"
        )

    directory = Path(get_settings().upload_dir).resolve() / "events"
    return service.upload_image(db, event_id, user.id, directory, content, extension)


@router.get("/{event_id}/participants", response_model=list[ParticipantRead])
def list_event_participants(
    event_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> list[ParticipantRead]:
    rows = service.list_participants(db, event_id, user.id)
    return [
        ParticipantRead(
            id=member.id,
            display_name=member.display_name,
            status=participation_status,
            attended=attended,
        )
        for member, participation_status, attended in rows
    ]


@router.get("", response_model=list[EventRead])
def list_events(
    status_filter: EventStatus | None = Query(default=None, alias="status"),
    search: str | None = Query(default=None, min_length=1, max_length=100),
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=100),
    db: Session = Depends(get_db),
) -> list[Event]:
    return service.list_events(db, status_filter, search, offset, limit)


@router.get("/participating", response_model=list[EventRead])
def list_participating_events(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[Event]:
    return service.participating_events(db, user.id)


@router.post("", response_model=EventRead, status_code=status.HTTP_201_CREATED)
def create_event(
    payload: EventCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Event:
    return service.create_event(db, payload.model_dump(), user.id)


@router.get("/{event_id}", response_model=EventRead)
def read_event(event_id: int, db: Session = Depends(get_db)) -> Event:
    return service.get_event(db, event_id)


@router.patch("/{event_id}", response_model=EventRead)
def update_event(
    event_id: int,
    payload: EventUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Event:
    return service.update_owned_event(
        db, event_id, user.id, payload.model_dump(exclude_unset=True)
    )


@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(
    event_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> Response:
    service.delete_owned_event(db, event_id, user.id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
