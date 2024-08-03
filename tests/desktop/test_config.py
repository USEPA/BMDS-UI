from pathlib import Path

from bmds_ui import __version__
from bmds_ui.desktop import config


def test_get_version_path():
    assert config.get_version_path("24.1") == "24_1"
    assert config.get_version_path("24.1.1.rc1") == "24_1"
    assert config.get_version_path("24.2") == "24_2"
    # check current version is valid
    assert isinstance(config.get_version_path(__version__), str)


def test_get_app_home():
    assert "bmds" in str(config.get_app_home())
    assert Path(".") == config.get_app_home(path_str=".")
