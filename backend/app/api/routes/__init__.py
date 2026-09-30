from fastapi import APIRouter

from app.api.routes import attendances, events, messages, participations, users

api_router = APIRouter()
api_router.include_router(users.router)
api_router.include_router(events.router)
api_router.include_router(participations.router)
api_router.include_router(messages.router)
api_router.include_router(attendances.router)
