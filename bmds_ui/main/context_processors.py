from django.conf import settings

from .constants import SkinStyle


def desktop_versions() -> dict:
    import pybmds
    from bmds_ui import __version__

    return {
        "online": __version__,
        "bmds": pybmds.__version__,
        "db_path": settings.DATABASES["default"]["NAME"],
    }


def from_settings(request):
    return dict(
        ADMIN_ROOT=settings.ADMIN_ROOT,
        SKIN=settings.SKIN,
        SkinStyleEnum=SkinStyle,
        SERVER_ROLE=settings.SERVER_ROLE,
        SERVER_BANNER_COLOR=settings.SERVER_BANNER_COLOR,
        CONTACT_US_EMAIL=settings.CONTACT_US_LINK,
        commit=settings.COMMIT,
        GTM_ID=settings.GTM_ID,
        IS_DESKTOP=settings.IS_DESKTOP,
        desktop_versions=desktop_versions,
    )
