from .base import *

INSTALLED_APPS += (
    "debug_toolbar",
    "django_browser_reload",
)
MIDDLEWARE += (
    "debug_toolbar.middleware.DebugToolbarMiddleware",
    "django_browser_reload.middleware.BrowserReloadMiddleware",
)
INTERNAL_IPS = ("127.0.0.1",)

DEBUG = True

SERVER_ROLE = "development environment"
SERVER_BANNER_COLOR = "#318d50"

EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

CELERY_TASK_ALWAYS_EAGER = True
CELERY_TASK_EAGER_PROPAGATES = True

INCLUDE_BETA_FEATURES = True

# disable throttling
REST_FRAMEWORK.update({"DEFAULT_THROTTLE_CLASSES": (), "DEFAULT_THROTTLE_RATES": {}})

try:
    # load local settings from `local.py` if they exist
    from .local import *
except ModuleNotFoundError:
    pass
