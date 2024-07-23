from sqlite3 import dbapi2 as Database

from django.db.backends.sqlite3 import base
from django.db.backends.sqlite3._functions import register as register_functions
from django.utils.asyncio import async_unsafe


class DatabaseWrapper(base.DatabaseWrapper):
    # TODO - remove w/ django 5.1 release
    # adapted from https://blog.pecar.me/sqlite-django-config
    # https://gcollazo.com/optimal-sqlite-settings-for-django/
    def _start_transaction_under_autocommit(self):
        # Acquire a write lock immediately for transactions
        self.cursor().execute("BEGIN IMMEDIATE")

    @async_unsafe
    def get_new_connection(self, conn_params):
        conn = Database.connect(**conn_params)
        register_functions(conn)

        conn.execute("PRAGMA foreign_keys=ON")
        conn.execute("PRAGMA legacy_alter_table = OFF")
        conn.execute("PRAGMA journal_mode = WAL")
        conn.execute("PRAGMA synchronous = NORMAL")
        conn.execute("PRAGMA busy_timeout = 5000")
        conn.execute("PRAGMA temp_store = MEMORY")
        conn.execute("PRAGMA mmap_size = 134217728")
        conn.execute("PRAGMA journal_size_limit = 67108864")
        conn.execute("PRAGMA cache_size = 2000")

        return conn
