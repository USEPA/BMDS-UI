from celery import shared_task
from celery.utils.log import get_task_logger
from django.contrib.auth import get_user_model
from django.utils import timezone

from .vacuum import is_sqlite, should_vacuum, vacuum
from .worker_health import worker_healthcheck

logger = get_task_logger(__name__)


@shared_task
def diagnostic_celery_task(id_: str):
    user = get_user_model().objects.get(id=id_)
    logger.info(f"Diagnostic celery task triggered by: {user}")
    return dict(success=True, when=str(timezone.now()), user=user.email)


@shared_task
def worker_healthcheck_push():
    worker_healthcheck.push()


@shared_task
def maybe_vacuum():
    if not is_sqlite():
        return
    logger.info("Checking vacuuum")
    if should_vacuum():
        logger.info("Vacuuum database")
        vacuum()
