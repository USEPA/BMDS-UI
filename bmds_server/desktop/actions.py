import os
from threading import Thread

from django.core.management import call_command

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
