import os

from .app import BmdsDesktopTui
from .config import Config


def main():
    os.environ["DJANGO_SETTINGS_MODULE"] = "bmds_server.main.settings.desktop"
    Config.get()
    app = BmdsDesktopTui()
    app.run()
