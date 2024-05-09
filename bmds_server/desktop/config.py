import os
import platform
import re
from datetime import UTC, datetime
from pathlib import Path
from typing import ClassVar, Self
from uuid import UUID, uuid4

from pydantic import BaseModel, Field

from .. import __version__


def now() -> datetime:
    return datetime.now(tz=UTC)


class Database(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    name: str = ""
    description: str = ""
    path: Path
    created: datetime = Field(default_factory=now)
    last_accessed: datetime = Field(default_factory=now)

    def __str__(self) -> str:
        return f"{self.name}: {self.path}"

    def update_last_accessed(self):
        self.last_accessed = datetime.now(tz=UTC)


class WebServer(BaseModel):
    host: str = "127.0.0.1"
    port: int = 5555


class DesktopConfig(BaseModel):
    version: int = 1
    server: WebServer
    databases: list[Database] = []
    created: datetime = Field(default_factory=now)

    @classmethod
    def default(cls) -> Self:
        return cls(server=WebServer())

    def add_db(self, db: Database):
        self.databases.insert(0, db)

    def get_db(self, id: UUID) -> Database:
        db = [db for db in self.databases if db.id == id]
        return db[0]

    def remove_db(self, db):
        self.databases.remove(db)


def get_version_path() -> str:
    """Get major/minor version path, ignoring patch or alpha/beta markers in version name"""
    if m := re.match(r"^(\d+).(\d+)", __version__):
        return f"{m[1]}_{m[2]}"
    raise ValueError("Cannot parse version string")


def get_app_home() -> Path:
    # if a custom path is specified, use that instead
    if path := os.environ.get("BMDS_APP_HOME"):
        return Path(path)
    # otherwise fallback to standard locations based on operating system
    app_home = Path.home()
    version = get_version_path()
    match platform.system():
        case "Windows":
            app_home = app_home / "AppData" / "Roaming" / "bmds" / version
        case "Darwin":
            app_home = app_home / "Library" / "Application Support" / "bmds" / version
        case "Linux" | _:
            app_home = app_home / ".bmds" / version
    app_home.mkdir(parents=True, exist_ok=True)
    return app_home


class Config:
    # singleton pattern for global app configuration
    _config_path: Path | None = None
    _config: ClassVar[DesktopConfig | None] = None

    @classmethod
    def get_config_path(cls) -> Path:
        last_config = get_app_home() / "latest.txt"
        if last_config.exists():
            path = Path(last_config.read_text())
            if path.exists():
                return path
        # if the path doesn't exist, create a new default configuration and persist to disk
        default_config = get_app_home() / "config.json"
        default_config.write_text(DesktopConfig.default().model_dump_json(indent=2))
        last_config.write_text(str((default_config).resolve()))
        return default_config

    @classmethod
    def get(cls) -> DesktopConfig:
        if cls._config:
            return cls._config
        cls._config_path = cls.get_config_path()
        cls._config = DesktopConfig.model_validate_json(cls._config_path.read_text())
        return cls._config

    @classmethod
    def sync(cls):
        # write to disk
        if cls._config is None or cls._config_path is None:
            raise ValueError()
        cls._config_path.write_text(cls._config.model_dump_json(indent=2))
