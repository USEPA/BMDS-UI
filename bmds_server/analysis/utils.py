from textwrap import dedent

from bmds.utils import get_version
from django.conf import settings
from django.utils.timezone import now

from .. import __version__


def get_citation() -> str:
    """
    Return a citation for the software.
    """
    year = now().strftime("%Y")
    accessed = now().strftime("%B %d, %Y")
    version = get_version()
    uri = settings.WEBSITE_URI
    return dedent(
        f"""\
        United States Environmental Protection Agency. ({year}). BMDS Online ({__version__}; pybmds {version.python}; bmdscore {version.dll}) [Web App]. Available from {uri}. Accessed {accessed}."""
    )
