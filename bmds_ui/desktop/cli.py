import argparse
import os
import sys
from pathlib import Path

from .. import __version__
from .actions import create_shortcut, show_version
from .app import BmdsDesktopTui
from .config import Config, get_default_config_path
from .exceptions import DesktopException
from .log import setup_logging


def get_app(config: str | None = None) -> BmdsDesktopTui:
    if config:
        p = Path(config).expanduser().resolve()
        os.environ["BMDS_CONFIG"] = str(p)
    setup_logging()
    os.environ["DJANGO_SETTINGS_MODULE"] = "bmds_ui.main.settings.desktop"
    Config.get()
    return BmdsDesktopTui()


def main():
    parser = argparse.ArgumentParser(description=f"BMDS Desktop ({__version__})")
    parser.add_argument("--version", "-V", action="store_true", help="Show version")
    parser.add_argument("--create-shortcut", action="store_true", help="Create a shortcut")
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
    if args.create_shortcut:
        return create_shortcut()
    try:
        get_app(config=args.config).run()
    except DesktopException as err:
        sys.stderr.write(str(err) + "\n")
        exit(code=1)
