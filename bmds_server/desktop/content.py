from textwrap import dedent

from .. import __version__


def title() -> str:
    return f"BMDS Desktop ({__version__})"


def description() -> str:
    return dedent("""
    This application is the desktop launcher for the BMDS Desktop application.  BMDS Desktop runs in your browser, but the data and execution are all performed locally on your computer. An online application exists: [https://bmdsonline.epa.gov](https://bmdsonline.epa.gov).
    """)


def version_check(check: bool = False) -> str:
    return (
        "[b]Status:[/b] Checked (TODO - implement)" if check else "[b]Status:[/b] Not yet checked"
    )
