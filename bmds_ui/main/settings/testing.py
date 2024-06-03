from ..constants import AuthProvider
from .dev import *

INSTALLED_APPS = [app for app in INSTALLED_APPS if app != "debug_toolbar"]
MIDDLEWARE = [middleware for middleware in MIDDLEWARE if "debug_toolbar" not in middleware]

LOGGING["loggers"]["bmds_ui"]["propagate"] = True
LOGGING["loggers"]["bmds_ui.request"]["propagate"] = True

SKIN = SkinStyle.Base
DATABASES["default"]["TEST"] = {"NAME": "bmds-server-test"}

PASSWORD_HASHERS = ("django.contrib.auth.hashers.MD5PasswordHasher",)

AUTH_PROVIDERS = {AuthProvider.django, AuthProvider.external}

ALWAYS_SHOW_FUTURE = False
IS_DESKTOP = False
IS_TESTING = True
