import logging
import math
from datetime import datetime

from django.conf import settings
from django.core.cache import cache
from django.db import connection
from django.utils import timezone

logger = logging.getLogger(__name__)

VACUUM_TIMESTAMP_CACHE_KEY = "db-vacuum-timestamp"


def clear_vacuum_cache():
    cache.delete(VACUUM_TIMESTAMP_CACHE_KEY)


def is_sqlite() -> bool:
    """Is the current database a SQLite database?"""
    return "sqlite" in settings.DATABASES["default"]["ENGINE"]


def should_vacuum() -> bool:
    """Returns True if last vacuum if a vacuum is required based on timestamp of last vacuum."""
    now = timezone.now()
    last_vacuum = cache.get(VACUUM_TIMESTAMP_CACHE_KEY)
    if last_vacuum:
        last_vacuum = datetime.fromisoformat(last_vacuum)
    if last_vacuum is None:
        logger.info("VACUUM required, last vacuum unknown")
        return True
    last_vacuum_seconds = math.ceil((now - last_vacuum).total_seconds())
    if last_vacuum_seconds >= settings.DB_VACUUM_INTERVAL_SECONDS:
        logger.info(f"VACUUM required; last vacuum {last_vacuum_seconds} seconds ago")
        return True
    return False


def vacuum() -> bool:
    """Vacuum if the database is SQLite, return True if a vacuum completed. Set cache timestamp."""
    if is_sqlite():
        with connection.cursor() as cursor:
            logger.info("VACUUM database...")
            cursor.execute("VACUUM")
            cache.set(VACUUM_TIMESTAMP_CACHE_KEY, timezone.now().isoformat())
        return True
    return False
