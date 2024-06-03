from .dev import *

# Override settings here

DATABASES = {"default": {"ENGINE": "django.db.backends.sqlite3", "NAME": ROOT_DIR / "db.sqlite3"}}

if "fixture" in DATABASES["default"]["NAME"]:
    PASSWORD_HASHERS = ("django.contrib.auth.hashers.MD5PasswordHasher",)
