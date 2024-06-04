from unittest.mock import patch

import django

from bmds_ui import manage


def test_manage(capsys):
    with patch("sys.argv", ["manage.py", "--version"]):
        manage()
    captured = capsys.readouterr()
    assert django.get_version() in captured.out.strip()
