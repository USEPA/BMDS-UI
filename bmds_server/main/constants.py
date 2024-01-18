import platform
from enum import IntEnum, StrEnum
from pathlib import Path


class AuthProvider(StrEnum):
    django = "django"
    external = "external"


class SkinStyle(IntEnum):
    Base = 0
    EPA = 1


def get_app_home() -> Path:
    app_home = Path.home()
    match platform.system():
        case "Windows":
            # app_home = app_home / "AppData" / "Roaming" / "bmds"
            app_home = Path("c:/bit9prog/dev/bmds-server")
        case "Darwin":
            app_home = app_home / "Library" / "Application Support" / "bmds"
        case "Linux" | _:
            app_home = app_home / ".bmds"
    app_home.mkdir(parents=True, exist_ok=True)
    return app_home


# new config that get_db_location, |path| ,
# start root, append config db path, then can nav up/dpown dir tree
