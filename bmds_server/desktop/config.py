import platform
from datetime import UTC, datetime
from pathlib import Path
from typing import ClassVar, Self

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


class Config:
    # singleton pattern for global app configuration
    _config_path: Path | None = None
    _config: ClassVar[DesktopConfig | None] = None

    @classmethod
    def get(cls) -> DesktopConfig:
        # load from disk
        if cls._config is not None:
            return cls._config
        if cls._config_path is None:
            cls._config_path = get_app_home() / "config.json"
        if not cls._config_path.exists():
            cls._config = DesktopConfig.default()
            cls.sync()
        cls._config = DesktopConfig.model_validate_json(cls._config_path.read_text())
        return cls._config

    @classmethod
    def sync(cls):
        # write to disk
        if cls._config is None or cls._config_path is None:
            raise ValueError()
        cls._config_path.write_text(cls._config.model_dump_json(indent=2))
