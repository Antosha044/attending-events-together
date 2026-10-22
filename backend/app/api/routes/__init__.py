from fastapi import APIRouter

from app.api.routes import attendances, auth, events, messages, participations

api_router = APIRouter()
api_router.include_router(events.router)
api_router.include_router(participations.router)
api_router.include_router(messages.router)
api_router.include_router(attendances.router)
api_router.include_router(auth.router)
