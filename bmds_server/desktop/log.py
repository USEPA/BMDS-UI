import logging
from io import StringIO
from logging import getLogger
from logging.handlers import RotatingFileHandler

from .config import get_app_home

stream = StringIO()
log = getLogger("app")


def setup_logging():
    logging.basicConfig(stream=stream, level=logging.INFO, format="%(message)s")
    logger = logging.getLogger()
    logfile = get_app_home() / "log.txt"
    max_bytes = 10 * 1024 * 1024  # 10 MB
    handler = RotatingFileHandler(logfile, maxBytes=max_bytes, backupCount=5)
    handler.formatter = logging.Formatter(
        "%(asctime)s.%(msecs)03d %(levelname)s %(name)s %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    logger.addHandler(handler)
    log.info(f"Writing logs to {logfile}")
