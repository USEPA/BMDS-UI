import argparse
import os

from .. import __version__
from .app import BmdsDesktopTui
from .config import Config
from .log import setup_logging


def get_app() -> BmdsDesktopTui:
    setup_logging()
    # os.environ["DJANGO_SETTINGS_MODULE"] = "bmds_ui.main.settings.desktop"
    Config.get()
    return BmdsDesktopTui()


def show_version():
    """Show the version for BMDS Desktop"""
    print(__version__)  # noqa: T201


def main():
    parser = argparse.ArgumentParser(description="BMDS Desktop Startup Interface")
    parser.add_argument("--version", "-V", action="store_true", help="Show version")
    args = parser.parse_args()
    if args.version:
        return show_version()
    get_app().run()
