import os

from ...desktop.config import get_app_home
from ..constants import SkinStyle
from .base import *

APP_HOME = get_app_home()
ALLOWED_HOSTS = ["*"]
IS_DESKTOP = True

SKIN = SkinStyle.EPA
SERVER_ROLE = "production"
SERVER_BANNER_COLOR = "black"

PUBLIC_DATA_ROOT = APP_HOME / "public"
LOGS_PATH = APP_HOME / "logs"
STATIC_ROOT = PUBLIC_DATA_ROOT / "static"
MEDIA_ROOT = PUBLIC_DATA_ROOT / "media"

PUBLIC_DATA_ROOT.mkdir(exist_ok=True, parents=False)
LOGS_PATH.mkdir(exist_ok=True, parents=False)

CELERY_TASK_ALWAYS_EAGER = True
CELERY_TASK_EAGER_PROPAGATES = True

CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "TIMEOUT": 60 * 10,  # 10 minutes (in seconds)
    }
}

DJANGO_VITE["default"]["manifest_path"] = str(STATIC_ROOT / "bundles" / "manifest.json")

DB_VACUUM_INTERVAL_SECONDS = 120  # interval (in seconds)

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": os.getenv("BMDS_DB", APP_HOME / "bmds-desktop.db"),
        "OPTIONS": {
            "transaction_mode": "IMMEDIATE",
            "init_command": "PRAGMA foreign_keys=ON; PRAGMA legacy_alter_table = OFF; PRAGMA journal_mode = WAL; PRAGMA synchronous = NORMAL; PRAGMA busy_timeout = 5000; PRAGMA temp_store = MEMORY; PRAGMA mmap_size = 134217728; PRAGMA journal_size_limit = 67108864; PRAGMA cache_size = 2000;",
        },
    }
}


def setup_logging(path: Path):
    return {
        "version": 1,
        "disable_existing_loggers": False,
        "filters": {"require_debug_false": {"()": "django.utils.log.RequireDebugFalse"}},
        "formatters": {"basic": {"format": "%(levelname)s %(asctime)s %(name)s %(message)s"}},
        "handlers": {
            "mail_admins": {
                "level": "ERROR",
                "filters": ["require_debug_false"],
                "class": "django.utils.log.AdminEmailHandler",
            },
            "console": {"level": "DEBUG", "class": "logging.StreamHandler", "formatter": "basic"},
            "file": {
                "level": "DEBUG",
                "class": "logging.handlers.RotatingFileHandler",
                "formatter": "basic",
                "filename": str(path / "django.log"),
                "maxBytes": 10 * 1024 * 1024,  # 10 MB
                "backupCount": 10,
            },
            "requests": {
                "level": "INFO",
                "class": "logging.handlers.RotatingFileHandler",
                "formatter": "basic",
                "filename": str(path / "requests.log"),
                "maxBytes": 10 * 1024 * 1024,  # 10 MB
                "backupCount": 10,
            },
            "null": {"class": "logging.NullHandler"},
        },
        "loggers": {
            "": {"handlers": ["console"], "level": "INFO"},
            "django": {"handlers": ["console"], "propagate": False, "level": "INFO"},
            "django.request": {"handlers": ["console"], "level": "ERROR", "propagate": True},
            "bmds_ui": {"handlers": ["console"], "propagate": False, "level": "INFO"},
            "bmds_ui.request": {"handlers": ["console"], "propagate": False, "level": "INFO"},
        },
    }


CONTACT_US_LINK = "https://ecomments.epa.gov/bmds/"
