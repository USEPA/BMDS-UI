from textwrap import dedent

from .. import __version__
from .actions import get_installed_version, get_latest_version, get_version_message


def title() -> str:
    return f"BMDS Desktop ({__version__})"


def description() -> str:
    return dedent("""
    This application is the desktop launcher for the BMDS Desktop application.  BMDS Desktop runs in your browser, but the data and execution are all performed locally on your computer. An online application exists: [https://bmdsonline.epa.gov](https://bmdsonline.epa.gov).
    """)


def version_check(check: bool = False) -> str:
    if not check:
        return "**Status:** Ready to check - this requires an internet connection."
    current = get_installed_version()
    try:
        latest_date, latest = get_latest_version("bmds")  # TODO - change to bmds-ui
    except ValueError as err:
        return str(err)
    try:
        return get_version_message(current, latest, latest_date)
    except ValueError:
        return "Unable to compare versions."
