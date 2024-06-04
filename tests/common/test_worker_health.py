import pytest
from django.conf import settings

from bmds_ui.common.worker_health import WorkerHealthcheck


def has_redis():
    return "RedisCache" in settings.CACHES["default"]["BACKEND"]


@pytest.mark.skipif(not has_redis(), reason="skip; redis cache required")
def test_worker_healthcheck():
    worker = WorkerHealthcheck()
    worker.clear()

    # no data; should be an error
    assert worker.healthy() is False
    assert worker.series().size == 0

    # has recent data; should be healthy
    worker.MAX_SIZE = 5
    for i in range(worker.MAX_SIZE + 2):
        worker.push()
    assert worker.healthy() is True
    assert worker.series().size == worker.MAX_SIZE

    # set an old date; should fail
    worker.clear()
    conn = worker._get_conn()
    conn.lpush(worker.KEY, 915148800.000000)  # party like its ...
    assert worker.healthy() is False
    assert worker.series().size == 1
