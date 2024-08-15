import os
import platform
import re
import socket
import time
from datetime import UTC, datetime
from pathlib import Path
from typing import ClassVar, Self
from uuid import UUID, uuid4

from pydantic import BaseModel, ConfigDict, Field, ValidationError, field_validator

from .exceptions import DesktopException


def now() -> datetime:
    return datetime.now(tz=UTC)


db_suffixes = (".db", ".sqlite", ".sqlite3")


class Database(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    name: str = Field(min_length=1)
    description: str = ""
    path: Path
    created: datetime = Field(default_factory=now)
    last_accessed: datetime = Field(default_factory=now)

    model_config = ConfigDict(str_strip_whitespace=True)

    def __str__(self) -> str:
        return f"{self.name}: {self.path}"

    def update_last_accessed(self):
        self.last_accessed = datetime.now(tz=UTC)

    @field_validator("path")
    @classmethod
    def path_check(cls, path: Path):
        # resolve the fully normalized path
        path = path.expanduser().resolve()

        # check suffix
        if path.suffix not in db_suffixes:
            raise ValueError('Filename must end with the "sqlite" extension')

        return path


class WebServer(BaseModel):
    host: str = "127.0.0.1"
    port: int = 5555

    def is_free(self) -> bool:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            try:
                s.bind((self.host, self.port))
                return True
            except OSError:
                return False

    def wait_till_free(self, timeout_sec=60):
        seconds_slept = 0
        while self.is_free() is False and seconds_slept <= timeout_sec:
            time.sleep(1)
            seconds_slept += 1
        if seconds_slept > timeout_sec:
            raise ValueError(f"Cannot secure connection; already in use? {self.host}:{self.port}")

    def find_free_port(self):
        while True:
            if self.is_free():
                return
            self.port = self.port + 1

    @property
    def web_address(self):
        return f"http://{self.host}:{self.port}"


LATEST_CONFIG_VERSION = 1


class DesktopConfig(BaseModel):
    version: int = LATEST_CONFIG_VERSION
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


def get_version_path(version: str) -> str:
    """Get major/minor version path, ignoring patch or alpha/beta markers in version name"""
    if m := re.match(r"^(\d+).(\d+)", version):
        return f"{m[1]}_{m[2]}"
    raise ValueError("Cannot parse version string")


def get_default_config_path() -> Path:
    # get reasonable config path defaults by OS
    # adapted from `hatch` source code
    # https://github.com/pypa/hatch/blob/3adae6c0dfd5c20dfe9bf6bae19b44a696c22a43/docs/config/hatch.md?plain=1#L5-L15
    app_home = Path.home()
    match platform.system():
        case "Windows":
            app_home = app_home / "AppData" / "Local" / "bmds"
        case "Darwin":
            app_home = app_home / "Library" / "Application Support" / "bmds"
        case "Linux" | _:
            config = Path(os.environ.get("XDG_CONFIG_HOME", "~/.config")).expanduser().resolve()
            app_home = config / "bmds"
    return app_home


def get_app_home(path_str: str | None = None) -> Path:
    """Get path for storing configuration data for this application."""
    # if a custom path is specified, use that instead
    path_str = path_str or os.environ.get("BMDS_CONFIG")
    app_home = Path(path_str) if path_str else get_default_config_path()
    app_home.mkdir(parents=True, exist_ok=True)
    return app_home


class Config:
    # singleton pattern for global app configuration
    _config_path: Path | None = None
    _config: ClassVar[DesktopConfig | None] = None

    @classmethod
    def get_config_path(cls) -> Path:
        # if configuration file doesn't exist, create one. return the file
        config = get_app_home() / f"config-v{LATEST_CONFIG_VERSION}.json"
        if not config.exists():
            config.write_text(DesktopConfig.default().model_dump_json(indent=2))
        return config

    @classmethod
    def get(cls) -> DesktopConfig:
        if cls._config:
            return cls._config
        cls._config_path = cls.get_config_path()
        if not cls._config_path.exists():
            raise DesktopException(f"Configuration file not found: {cls._config_path}")
        try:
            cls._config = DesktopConfig.model_validate_json(cls._config_path.read_text())
        except ValidationError as err:
            raise DesktopException(f"Cannot parse configuration: {cls._config_path}") from err
        return cls._config

    @classmethod
    def sync(cls):
        # write to disk
        if cls._config is None or cls._config_path is None:
            raise DesktopException()
        cls._config_path.write_text(cls._config.model_dump_json(indent=2))
