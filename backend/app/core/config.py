from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

ENV_FILE = Path(__file__).resolve().parents[3] / ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=ENV_FILE, env_file_encoding="utf-8", extra="ignore"
    )

    app_name: str
    api_v1_prefix: str
    database_url: str
    cors_origins: list[str]
    jwt_secret: str = Field(min_length=32)
    access_token_minutes: int = Field(gt=0)
    refresh_token_days: int = Field(gt=0)
    upload_dir: str


@lru_cache
def get_settings() -> Settings:
    return Settings()
