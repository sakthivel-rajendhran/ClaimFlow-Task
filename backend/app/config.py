from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    # MongoDB
    MONGODB_URI: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "claimflow"

    # JWT
    JWT_SECRET: str = "changeme-super-secret-key-please-update"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 1440  # 24 hours

    # File Upload
    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10 MB

    # CORS
    FRONTEND_URL: str = "http://localhost:5173"
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    # App
    APP_NAME: str = "ClaimFlow"
    APP_VERSION: str = "1.0.0"

    class Config:
        env_file = ".env"
        case_sensitive = True

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]


settings = Settings()
