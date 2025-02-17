import logging
import random
import string
from collections.abc import Callable
from datetime import datetime
from functools import wraps

from django.conf import settings
from django.core.cache import cache
from django.db import connection

_random_string_pool = string.ascii_lowercase + string.digits
logger = logging.getLogger(__name__)


def random_string(samples: str = _random_string_pool, length: int = 12) -> str:
    """
    Generate a random string on specific length.

    Args:
        samples (str, optional): Random characters to select from.
        length (int, optional): Size of generated string; defaults to 12.
    """
    return "".join(random.choices(_random_string_pool, k=length))  # noqa: S311


def to_timestamp(dt: datetime) -> str:
    return dt.strftime("%Y-%b-%d %H:%m %Z")


def get_bool(value: str | None) -> bool:
    return value is not None and value.lower() == "true"


def timeout_cache(key: str, timeout: int) -> Callable:
    """Decorator to cache result key for N seconds

    Args:
        key (str): the cache key
        timeout (int): timeout
    """

    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            data = cache.get(key)
            if data is None:
                logger.info(f"Caching `{key}` for {timeout}s")
                data = func(*args, **kwargs)
                cache.set(key, data, timeout=timeout)
            return data

        return wrapper

    return decorator


def is_sqlite() -> bool:
    return "sqlite" in settings.DATABASES["default"]["ENGINE"]


def vacuum() -> bool:
    if is_sqlite():
        with connection.cursor() as cursor:
            cursor.execute("VACUUM;")
        return True
    return False
