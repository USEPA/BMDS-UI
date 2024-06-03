import json
import os
from datetime import datetime
from pathlib import Path
from subprocess import CalledProcessError

from ... import __version__
from ...common.git import Commit
from ..constants import AuthProvider, SkinStyle

PROJECT_NAME = "bmds-server"
BASE_DIR = Path(__file__).parents[2].resolve()
ROOT_DIR = Path(__file__).parents[3].resolve()

# data paths
PUBLIC_DATA_ROOT = Path(os.environ.get("PUBLIC_DATA_ROOT", ROOT_DIR / "public"))
LOGS_PATH = Path(os.environ.get("LOGS_PATH", ROOT_DIR / "logs"))

# make sure these paths exist
PUBLIC_DATA_ROOT.mkdir(exist_ok=True, parents=False)
LOGS_PATH.mkdir(exist_ok=True, parents=False)

SKIN = SkinStyle.Base

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # 3rd party apps
    "rest_framework",
    "rest_framework.authtoken",
    "webpack_loader",
    "reversion",
    # Custom apps
    "bmds_ui.common",
    "bmds_ui.analysis",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "bmds_ui.common.middleware.RequestLogMiddleware",
    "reversion.middleware.RevisionMiddleware",
]

ROOT_URLCONF = "bmds_ui.main.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [str(BASE_DIR / "templates")],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
                "bmds_ui.main.context_processors.from_settings",
            ]
        },
    }
]

WSGI_APPLICATION = "bmds_ui.main.wsgi.application"
SECRET_KEY = "io^^q^q1))7*r0u@6i+6kx&ek!yxyf6^5vix_6io6k4kdn@@5t"  # noqa: S105

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.getenv("DJANGO_DB_NAME", "bmds-online"),
        "USER": os.getenv("DJANGO_DB_USER", "bmds-online"),
        "PASSWORD": os.getenv("DJANGO_DB_PW", "password"),
        "HOST": os.getenv("DJANGO_DB_HOST", "localhost"),
        "PORT": os.getenv("DJANGO_DB_PORT", "5432"),
    }
}
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
LOGIN_URL = "login"
LOGIN_REDIRECT_URL = "home"
LOGOUT_REDIRECT_URL = os.getenv("LOGOUT_REDIRECT", "home")


# add randomness to admin url
ADMIN_URL_PREFIX = "8v99wgnw7"
ADMIN_ROOT = os.environ.get("ADMIN_ROOT", "")

# add randomness to healthcheck url
HEALTHCHECK_URL_PREFIX = os.getenv("HEALTHCHECK_URL_PREFIX", "e9eaf4dabac7")

AUTH_PROVIDERS = {AuthProvider(p) for p in os.getenv("AUTH_PROVIDERS", "django").split("|")}
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "en-us"
TIME_ZONE = os.getenv("TIME_ZONE", "US/Eastern")
USE_TZ = True

ALWAYS_SHOW_FUTURE = bool(os.environ.get("ALWAYS_SHOW_FUTURE_MODE", "False") == "True")

EMAIL_SUBJECT_PREFIX = f"[{PROJECT_NAME}] "
DEFAULT_FROM_EMAIL = f"admin@{PROJECT_NAME}.com"

STATIC_URL = "/static/"
STATICFILES_DIRS = [str(BASE_DIR / "static")]

STATIC_ROOT = str(PUBLIC_DATA_ROOT / "static")
MEDIA_ROOT = str(PUBLIC_DATA_ROOT / "media")

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
        "": {"handlers": ["null"], "level": "INFO"},
        "django": {"handlers": ["null"], "propagate": False, "level": "INFO"},
        "django.request": {
            "handlers": ["console", "mail_admins"],
            "level": "ERROR",
            "propagate": True,
        },
        "bmds_ui": {"handlers": ["console"], "propagate": False, "level": "INFO"},
        "bmds_ui.request": {"handlers": ["console"], "propagate": False, "level": "INFO"},
    },
}

# Session and authentication
SESSION_ENGINE = "django.contrib.sessions.backends.cached_db"
SESSION_COOKIE_AGE = int(os.getenv("SESSION_DURATION", "28800"))  # 8 hours
SESSION_COOKIE_DOMAIN = os.getenv("DJANGO_SESSION_COOKIE_DOMAIN", None)
SESSION_COOKIE_NAME = os.getenv("DJANGO_SESSION_COOKIE_NAME", "sessionid")

# Celery
CELERYD_HIJACK_ROOT_LOGGER = False
CELERY_SEND_TASK_ERROR_EMAILS = True
CELERY_TASK_ACKS_LATE = True
CELERY_TASK_SOFT_TIME_LIMIT = 300
CELERY_TASK_TIME_LIMIT = 360
CELERY_TIMEZONE = TIME_ZONE
CELERY_WORKER_MAX_TASKS_PER_CHILD = 100
CELERY_WORKER_PREFETCH_MULTIPLIER = 1

# Cache settings
CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": os.getenv("DJANGO_CACHE_LOCATION"),
        "OPTIONS": {"CLIENT_CLASS": "django_redis.client.DefaultClient"},
        "TIMEOUT": 60 * 10,  # 10 minutes (in seconds)
    }
}

REST_FRAMEWORK = {
    "DEFAULT_THROTTLE_CLASSES": (
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
    ),
    "DEFAULT_THROTTLE_RATES": {"anon": "20/minute", "user": "120/minute"},
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework.authentication.TokenAuthentication",
        "bmds_ui.common.auth.SessionCsrfAuthentication",
    ),
}

WEBPACK_LOADER = {
    "DEFAULT": {
        "BUNDLE_DIR_NAME": "bundles/",
        "STATS_FILE": str(BASE_DIR / "webpack-stats.json"),
        "POLL_INTERVAL": 0.1,
        "IGNORE": [".+/.map"],
    }
}

DAYS_TO_KEEP_ANALYSES = 180


# commit information
def get_git_commit() -> Commit:
    if GIT_COMMIT_FILE.exists():
        return Commit.model_validate_json(GIT_COMMIT_FILE.read_text())
    try:
        return Commit.current(str(ROOT_DIR))
    except (CalledProcessError, FileNotFoundError):
        return Commit(sha="<undefined>", dt=datetime.now())


GIT_COMMIT_FILE = BASE_DIR / "gitcommit.json"
COMMIT = get_git_commit()

# Google Tag Manager settings
GTM_ID = os.getenv("GTM_ID")

# optionally enable sentry
if SENTRY_DSN := os.environ.get("SENTRY_DSN"):
    import sentry_sdk
    from sentry_sdk.integrations.django import DjangoIntegration

    SENTRY_SETTINGS = json.loads(
        os.environ.get("SENTRY_SETTINGS", '{"traces_sample_rate": 1.0, "send_default_pii": false}')
    )
    release = COMMIT.sha if "undefined" not in COMMIT.sha else __version__
    SENTRY_SETTINGS.setdefault("release", release)
    sentry_sdk.init(dsn=SENTRY_DSN, integrations=[DjangoIntegration()], **SENTRY_SETTINGS)

TEST_DB_FIXTURE = ROOT_DIR / "tests/data/db.yaml"
CONTACT_US_LINK = os.getenv("CONTACT_US_LINK", "")
WEBSITE_URI = os.getenv("WEBSITE_URI", "https://example.com")
INCLUDE_ADMIN = bool(os.environ.get("INCLUDE_ADMIN", "True") == "True")

INCLUDE_BETA_FEATURES = bool(os.environ.get("INCLUDE_BETA", "False") == "True")
IS_DESKTOP = False
IS_TESTING = False
