from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.api.routes import api_router
from app.core.config import get_settings
from app.core.exceptions import ApplicationError

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    description="Events, event groups, messages and attendance for the Together Events project.",
)


@app.exception_handler(ApplicationError)
async def application_error_handler(
    request: Request, exc: ApplicationError
) -> JSONResponse:
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(api_router, prefix=settings.api_v1_prefix)
upload_dir = Path(settings.upload_dir).resolve()
upload_dir.mkdir(parents=True, exist_ok=True)
app.mount("/media", StaticFiles(directory=upload_dir), name="media")


@app.get("/health", tags=["health"])
def health() -> dict[str, str]:
    return {"status": "ok"}
