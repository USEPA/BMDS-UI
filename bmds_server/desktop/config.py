import platform
from datetime import UTC, datetime
from pathlib import Path
from typing import Self

from pydantic import BaseModel, Field


def now() -> datetime:
    return datetime.now(UTC)


class Databases(BaseModel):
    name: str = ""
    description: str = ""
    path: Path
    created: datetime = Field(default_factory=now)
    last_accessed: datetime = Field(default_factory=now)


class WebServer(BaseModel):
    host: str = "127.0.0.1"
    port: int = 5555


class DesktopConfig(BaseModel):
    server: WebServer
    databases: list[Databases] = []
    created: datetime = Field(default_factory=now)

    @classmethod
    def default(cls) -> Self:
        return cls(server=WebServer())

    def create_db(self, path: Path, name: str = "", description: str = ""):
        self.databases.append(Databases(path=path, name=name, description=description))


def get_app_home() -> Path:
    app_home = Path.home()
    match platform.system():
        case "Windows":
            app_home = app_home / "AppData" / "Roaming" / "bmds"
        case "Darwin":
            app_home = app_home / "Library" / "Application Support" / "bmds"
        case "Linux" | _:
            app_home = app_home / ".bmds"
    app_home.mkdir(parents=True, exist_ok=True)
    return app_home
