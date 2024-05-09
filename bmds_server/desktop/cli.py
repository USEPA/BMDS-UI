import os

from .app import BmdsDesktopTui
from .config import Config
from .log import setup_logging


def main():
    setup_logging()
    os.environ["DJANGO_SETTINGS_MODULE"] = "bmds_server.main.settings.desktop"
    Config.get()
    app = BmdsDesktopTui()
    app.run()
