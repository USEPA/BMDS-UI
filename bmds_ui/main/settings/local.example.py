from .dev import *

# Override settings here

DATABASES = {"default": {"ENGINE": "django.db.backends.sqlite3", "NAME": ROOT_DIR / "db.sqlite3"}}

if "fixture" in DATABASES["default"]["NAME"]:
    PASSWORD_HASHERS = ("django.contrib.auth.hashers.MD5PasswordHasher",)

"""
To run a "real" cache and separate worker processes using redis:

```bash
# build redis container and start
docker-compose -f compose/dc-build.yml --project-directory . build redis
docker-compose -f compose/dc-build.yml --project-directory . up -d redis

# check that it's up...
redis-cli -a default-password ping

# start celery worker and beat (each in new tab)
celery --app=bmds_ui.main.celery worker --loglevel=INFO
celery --app=bmds_ui.main.celery beat --loglevel=INFO
```

And then uncomment lines below:
"""
# CACHES["default"] = dict(
#     BACKEND="django_redis.cache.RedisCache",
#     LOCATION="redis://:default-password@localhost:6379/0",
#     OPTIONS={"CLIENT_CLASS": "django_redis.client.DefaultClient"},
#     TIMEOUT=60 * 10,  # 10 minutes (in seconds)
# )
# CELERY_TASK_ALWAYS_EAGER = False
# CELERY_TASK_EAGER_PROPAGATES = False
# CELERY_BROKER_URL = "redis://:default-password@localhost:6379/1"
# CELERY_RESULT_BACKEND = "redis://:default-password@localhost:6379/2"
