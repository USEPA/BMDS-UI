import argparse
import os

from .. import __version__
from .app import BmdsDesktopTui
from .config import Config
from .log import setup_logging


def run_app():
    """Run the application"""
    setup_logging()
    os.environ["DJANGO_SETTINGS_MODULE"] = "bmds_server.main.settings.desktop"
    Config.get()
    app = BmdsDesktopTui()
    app.run()


def show_version():
    """Show the version for BMDS Desktop"""
    print(__version__)  # noqa: T201


def main():
    parser = argparse.ArgumentParser(description="BMDS Desktop Startup Interface")
    parser.add_argument("--version", "-V", action="store_true", help="Show version")
    args = parser.parse_args()
    if args.version:
        return show_version()
    run_app()
