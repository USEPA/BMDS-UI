from datetime import UTC, datetime, timedelta

import pandas as pd
from django_redis import get_redis_connection


class WorkerHealthcheck:
    KEY = "worker-healthcheck"
    MAX_SIZE = 60 * 24 // 5  # 1 day of data at a 5 minute-interval
    MAX_WAIT = timedelta(minutes=15)  # check is a failure if no task has run in X minutes

    def _get_conn(self):
        return get_redis_connection()

    def clear(self):
        """
        Clear worker healthcheck array
        """
        conn = self._get_conn()
        conn.delete(self.KEY)

    def push(self):
        """
        Push the latest successful time and trim the size of the array to max size
        """
        conn = self._get_conn()
        pipeline = conn.pipeline()
        pipeline.lpush(self.KEY, datetime.now(UTC).timestamp())
        pipeline.ltrim(self.KEY, 0, self.MAX_SIZE - 1)
        pipeline.execute()

    def healthy(self) -> bool:
        """Check if an item in the array has executed with the MAX_WAIT time from now"""
        conn = self._get_conn()
        last_push = conn.lindex(self.KEY, 0)
        if last_push is None:
            return False
        last_ping = datetime.fromtimestamp(float(last_push), UTC)
        return datetime.now(UTC) - last_ping < self.MAX_WAIT

    def series(self) -> pd.Series:
        """Return a pd.Series of last successful times"""
        conn = self._get_conn()
        data = conn.lrange(self.KEY, 0, -1)
        return pd.to_datetime(pd.Series(data, dtype=float), unit="s", utc=True)


worker_healthcheck = WorkerHealthcheck()
