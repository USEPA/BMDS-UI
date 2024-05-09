import os

from ...desktop.config import get_app_home
from ..constants import SkinStyle
from .base import *  # noqa: F403

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

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": os.getenv("BMDS_DB", APP_HOME / "bmds.sqlite3"),
        "STARTUP_OPTIONS": {"init_command": "PRAGMA journal_mode=wal;"},
    }
}

LOGGING = {
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
            "filename": str(LOGS_PATH / "django.log"),
            "maxBytes": 10 * 1024 * 1024,  # 10 MB
            "backupCount": 10,
        },
        "requests": {
            "level": "INFO",
            "class": "logging.handlers.RotatingFileHandler",
            "formatter": "basic",
            "filename": str(LOGS_PATH / "requests.log"),
            "maxBytes": 10 * 1024 * 1024,  # 10 MB
            "backupCount": 10,
        },
        "null": {"class": "logging.NullHandler"},
    },
    "loggers": {
        "": {"handlers": ["console"], "level": "INFO"},
        "django": {"handlers": ["console"], "propagate": False, "level": "INFO"},
        "django.request": {"handlers": ["console"], "level": "ERROR", "propagate": True},
        "bmds_server": {"handlers": ["console"], "propagate": False, "level": "INFO"},
        "bmds_server.request": {"handlers": ["console"], "propagate": False, "level": "INFO"},
    },
}
