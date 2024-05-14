import sys

from bmds_server import __version__
from bmds_server.desktop.cli import main


def test_version(capsys):
    sys.argv = ["bmds", "--version"]
    main()
    captured = capsys.readouterr()
    assert __version__ in captured.out
