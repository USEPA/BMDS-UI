import sys

from bmds_ui import __version__
from bmds_ui.desktop.cli import main


def test_version(capsys):
    sys.argv = ["bmds", "--version"]
    main()
    captured = capsys.readouterr()
    assert __version__ in captured.out
