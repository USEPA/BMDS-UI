import os

from .app import BmdsDesktopTui


def main():
    os.environ["DJANGO_SETTINGS_MODULE"] = "bmds_server.main.settings.desktop"
    app = BmdsDesktopTui()
    app.run()
