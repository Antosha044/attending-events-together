from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "События API"
    api_v1_prefix: str = "/api/v1"
    database_url: str = "postgresql+psycopg://events:change-me@localhost:5432/events"
    cors_origins: list[str] = ["http://localhost:5173"]
    jwt_secret: str = Field(default="replace-this-development-secret-before-deploying", min_length=32)
    access_token_minutes: int = Field(default=15, gt=0)
    refresh_token_days: int = Field(default=7, gt=0)


@lru_cache
def get_settings() -> Settings:
    return Settings()
