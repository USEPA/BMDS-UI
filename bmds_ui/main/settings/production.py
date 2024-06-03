import os
from pathlib import Path

from ..constants import SkinStyle
from .base import *

DEBUG = False

# deployment environment
SERVER_ROLE = os.environ["DJANGO_SERVER_ROLE"]
SERVER_BANNER_COLOR = "#EE8416"
SKIN = SkinStyle(int(os.environ["DJANGO_SKIN"]))

ADMINS = []
_admin_names = os.environ["DJANGO_ADMIN_NAMES"]
_admin_emails = os.environ["DJANGO_ADMIN_EMAILS"]
if _admin_names and _admin_emails:
    ADMINS = list(zip(_admin_names.split("|"), _admin_emails.split("|"), strict=True))
    MANAGERS = ADMINS
else:
    raise ValueError("Invalid DJANGO_ADMIN_NAMES or DJANGO_ADMIN_EMAILS")

SESSION_COOKIE_SECURE = bool(os.environ.get("DJANGO_HTTPS_ONLY") == "True")
CSRF_COOKIE_SECURE = bool(os.environ.get("DJANGO_HTTPS_ONLY") == "True")
CSRF_TRUSTED_ORIGINS = os.environ["DJANGO_CSRF_TRUSTED_ORIGINS"].split("|")
ALLOWED_HOSTS = os.environ["DJANGO_ALLOWED_HOSTS"].split("|")
SECRET_KEY = os.environ["DJANGO_SECRET_KEY"]
ADMIN_URL_PREFIX = os.environ["ADMIN_URL_PREFIX"]

# Email settings
DEFAULT_FROM_EMAIL = os.environ["DJANGO_DEFAULT_FROM_EMAIL"]
SERVER_EMAIL = DEFAULT_FROM_EMAIL
DJANGO_EMAIL_BACKEND = os.environ["DJANGO_EMAIL_BACKEND"]
if DJANGO_EMAIL_BACKEND == "SMTP":
    EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
    EMAIL_HOST = os.environ["DJANGO_EMAIL_HOST"]
    EMAIL_PORT = int(os.environ["DJANGO_EMAIL_PORT"])
    EMAIL_USE_SSL = os.environ["DJANGO_EMAIL_USE_SSL"].lower() == "true"
    if EMAIL_MESSAGEID_FQDN := os.environ.get("DJANGO_EMAIL_MESSAGEID_FQDN"):
        """
        Monkey-patch the FQDN for SMTP to our desired name; by default picks up container ID
        Can be removed if this PR is merged:
        - https://code.djangoproject.com/ticket/6989
        - https://github.com/django/django/pull/13728/files
        """
        from django.core.mail.utils import DNS_NAME

        DNS_NAME._fqdn = EMAIL_MESSAGEID_FQDN

elif DJANGO_EMAIL_BACKEND == "MAILGUN":
    INSTALLED_APPS += ("anymail",)
    EMAIL_BACKEND = "anymail.backends.mailgun.EmailBackend"
    ANYMAIL = dict(
        MAILGUN_API_KEY=os.environ["MAILGUN_ACCESS_KEY"],
        MAILGUN_SENDER_DOMAIN=os.environ["MAILGUN_SERVER_NAME"],
    )
elif DJANGO_EMAIL_BACKEND == "CONSOLE":
    EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
else:
    raise ValueError(f"Unknown email backend: {DJANGO_EMAIL_BACKEND}")

# Database settings
DATABASES["default"] = dict(
    ENGINE="django.db.backends.postgresql",
    NAME=os.environ["DJANGO_DB_NAME"],
    USER=os.environ["DJANGO_DB_USER"],
    PASSWORD=os.environ["DJANGO_DB_PW"],
    HOST=os.environ["DJANGO_DB_HOST"],
    CONN_MAX_AGE=300,
)

# Cache settings
CACHES["default"].update(
    BACKEND="django_redis.cache.RedisCache",
    LOCATION=os.environ["DJANGO_CACHE_LOCATION"],
    OPTIONS={"CLIENT_CLASS": "django_redis.client.DefaultClient"},
)

# REST framework
REST_FRAMEWORK["DEFAULT_RENDERER_CLASSES"] = ("rest_framework.renderers.JSONRenderer",)

# Logging settings
LOGGING["loggers"]["bmds_ui.request"]["handlers"] = ["console", "requests"]

# Celery settings
CELERY_BROKER_URL = os.environ["DJANGO_CELERY_BROKER_URL"]
CELERY_RESULT_BACKEND = os.environ["DJANGO_CELERY_RESULT_BACKEND"]

# load test db for dev/staging?
LOAD_TEST_DB = int(os.environ.get("LOAD_TEST_DB", 0))  # 0 = no; 1 = ifempty; 2 = always
if LOAD_TEST_DB:
    PASSWORD_HASHERS = ("django.contrib.auth.hashers.MD5PasswordHasher",)
    TEST_DB_FIXTURE = Path("/app/test-db-fixture.yaml")
