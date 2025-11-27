from pathlib import Path

from pydantic import BaseModel, Field


class Settings(BaseModel):
    """Application configuration."""

    api_title: str = "Fermentation Simulator API"
    api_version: str = "0.1.0"
    debug: bool = True
    c_library_path: str = Field(
        default=str(Path(__file__).resolve().parents[3] / "c_core" / "libfermentation.so")
    )


settings = Settings()
