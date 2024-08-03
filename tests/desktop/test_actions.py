from datetime import datetime

import pytest
from packaging.version import Version

from bmds_ui.desktop import actions


@pytest.mark.vcr
@pytest.mark.xfail(reason="Turn back on when we're ready for release")
def test_get_latest_version():
    uploaded, version = actions.get_latest_version("bmds")  # TODO - change to bmds-ui
    assert isinstance(uploaded, datetime)
    assert isinstance(version, Version)


def test_get_installed_version():
    version = actions.get_installed_version()
    assert isinstance(version, Version)


def test_get_version_message():
    latest_date = datetime.strptime("2024-05-28", "%Y-%m-%d")
    current = Version("2.0.0")
    latest = Version("2.0.0")

    resp = actions.get_version_message(current, latest, latest_date)
    assert "You have the latest version installed" in resp

    latest = Version("2.0.1")
    resp = actions.get_version_message(current, latest, latest_date)
    assert "There is a newer version available" in resp

    latest = Version("1.0.0")
    resp = actions.get_version_message(current, latest, latest_date)
    assert "You have a newer version than what's currently available" in resp
