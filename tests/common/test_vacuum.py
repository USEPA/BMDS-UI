from datetime import timedelta

import pytest
from django.conf import settings
from django.core.cache import cache
from django.utils import timezone

from bmds_ui.common import vacuum


def test_is_sqlite(settings):
    settings.DATABASES["default"]["ENGINE"] = "django.db.backends.sqlite3"
    assert vacuum.is_sqlite() is True

    settings.DATABASES["default"]["ENGINE"] = "django.db.backends.postgresql"
    assert vacuum.is_sqlite() is False


def test_should_vacuum():
    # vacuum if cache is unset
    vacuum.clear_vacuum_cache()
    assert vacuum.should_vacuum() is True

    # vacuum if last cache was older than threshold
    cache.set(
        vacuum.VACUUM_TIMESTAMP_CACHE_KEY,
        (timezone.now() - timedelta(seconds=settings.DB_VACUUM_INTERVAL_SECONDS + 1)).isoformat(),
    )
    assert vacuum.should_vacuum() is True

    # vacuum if last cache was newer than threshold
    cache.set(
        vacuum.VACUUM_TIMESTAMP_CACHE_KEY,
        (timezone.now() - timedelta(seconds=settings.DB_VACUUM_INTERVAL_SECONDS - 1)).isoformat(),
    )
    assert vacuum.should_vacuum() is False


@pytest.mark.django_db(transaction=True)
def test_vacuum(settings):
    vacuum.clear_vacuum_cache()

    settings.DATABASES["default"]["ENGINE"] = "django.db.backends.postgresql"
    assert vacuum.vacuum() is False
    assert cache.get(vacuum.VACUUM_TIMESTAMP_CACHE_KEY) is None

    settings.DATABASES["default"]["ENGINE"] = "django.db.backends.sqlite3"
    assert vacuum.vacuum() is True
    assert cache.get(vacuum.VACUUM_TIMESTAMP_CACHE_KEY) is not None
