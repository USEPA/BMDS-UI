from textwrap import dedent

from .. import __version__


def get_title_md() -> str:
    return f"# BMDS Desktop ({__version__})"


def get_desc_md() -> str:
    return dedent("""
    This application is the desktop launcher for the BMDS Desktop application.  BMDS Desktop runs in yoru browser, but the data and execution are all performed locally on your computer. An online application exists: [https://bmdsonline.epa.gov](https://bmdsonline.epa.gov).
    """)


def check_version_md(check: bool = False) -> str:
    return "Checked" if check else "Not checked!"
