import argparse
import os
from pathlib import Path

from .. import __version__
from .app import BmdsDesktopTui
from .config import Config, get_default_config_path
from .log import setup_logging


def get_app(config: str | None = None) -> BmdsDesktopTui:
    if config:
        os.environ["BMDS_CONFIG"] = str(Path(config).expanduser().resolve())
    setup_logging()
    os.environ["DJANGO_SETTINGS_MODULE"] = "bmds_ui.main.settings.desktop"
    Config.get()
    return BmdsDesktopTui()


def show_version():
    """Show the version for BMDS Desktop"""
    print(__version__)  # noqa: T201


def main():
    parser = argparse.ArgumentParser(description=f"BMDS Desktop ({__version__})")
    parser.add_argument("--version", "-V", action="store_true", help="Show version")
    parser.add_argument(
        "--config",
        metavar="config",
        action="store",
        help=f'Configuration path (Default: "{get_default_config_path()}")',
        type=str,
    )
    args = parser.parse_args()
    if args.version:
        return show_version()
    get_app(config=args.config).run()
