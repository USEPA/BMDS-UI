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

DJANGO_VITE["default"].update(
    **{
        "dev_mode": os.environ.get("NO_VITE_DEV") is None,
        "manifest_path": str(ROOT_DIR / "static" / "bundles" / "manifest.json"),
        "dev_server_port": 8150,
    }
)

# use a memory cache if no redis location specified
if CACHES["default"]["LOCATION"] is None:
    CACHES["default"]["BACKEND"] = "django.core.cache.backends.locmem.LocMemCache"
    CACHES["default"].pop("OPTIONS", None)

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
