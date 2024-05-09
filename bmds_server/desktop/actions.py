import os
from contextlib import redirect_stderr, redirect_stdout
from threading import Thread
from webbrowser import open_new_tab
from wsgiref.simple_server import WSGIServer, make_server

from django.conf import settings
from django.core.management import call_command
from whitenoise import WhiteNoise

from .config import Database, DesktopConfig
from .log import log, stream


def setup_django_environment(db: Database):
    os.environ["BMDS_DB"] = str(db.path)
    import django

    django.setup()


def _create_django_db(db):
    setup_django_environment(db)
    call_command("collectstatic", interactive=False, verbosity=3, stdout=stream, stderr=stream)
    call_command("migrate", interactive=False, verbosity=3, stdout=stream, stderr=stream)


def create_django_db(config: DesktopConfig, db: Database):
    log.info(f"Creating {db}")
    thread = Thread(target=_create_django_db, args=(db,), daemon=True)
    thread.start()
    thread.join()
    log.info(f"Creation successful {db}")


class AppThread(Thread):
    def __init__(self, config: DesktopConfig, db: Database, **kw):
        self.server: WSGIServer | None = None
        self.config = config
        self.db = db
        super().__init__(**kw)

    def _shutdown(self):
        # stop server from another thread to prevent deadlocks
        def _func(server: WSGIServer):
            server.shutdown()

        log.info("Stopping web application...")
        thread = Thread(target=_func, args=(self.server,))
        thread.start()
        log.info("Web application stopped")

    def run(self):
        setup_django_environment(self.db)
        from ..main.wsgi import application

        with redirect_stdout(stream), redirect_stderr(stream):
            app = WhiteNoise(application, root=settings.PUBLIC_DATA_ROOT)
            self.server = make_server(self.config.server.host, self.config.server.port, app)
            url = f"http://{self.config.server.host}:{self.config.server.port}"
            log.info(f"Starting {url}")
            if not settings.IS_TESTING:
                open_new_tab(url)
            try:
                self.server.serve_forever()
            except KeyboardInterrupt:
                log.info(f"Stopping {url}")
            finally:
                self._shutdown()

    def stop(self):
        log.info("Stopping server")
        if self.server is not None:
            self._shutdown()


class AppRunner:
    def __init__(self):
        self.thread: AppThread | None = None

    def start(self, config: DesktopConfig, db: Database):
        if self.thread is None:
            self.thread = AppThread(config=config, db=db, daemon=True)
            self.thread.start()

    def stop(self):
        if self.thread is not None:
            self.thread.stop()
            self.thread = None
