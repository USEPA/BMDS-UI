import re

from django.conf import settings
from django.utils.timezone import now

from pybmds.utils import get_version

from .. import __version__


def get_citation() -> str:
    """
    Return a citation for the software.
    """
    year = "20" + __version__[:2]
    accessed = now().strftime("%B %d, %Y")
    version = get_version()
    application = "BMDS Desktop" if settings.IS_DESKTOP else "BMDS Online"
    uri = "https://pypi.org/project/bmds-ui/" if settings.IS_DESKTOP else settings.WEBSITE_URI
    return f"U.S. Environmental Protection Agency. ({year}). {application} ({__version__}; pybmds {version.python}; bmdscore {version.dll}) [Software]. Available from {uri}. Accessed {accessed}."


re_hex_color = re.compile("^#(?:[0-9a-fA-F]{3}){1,2}$")
