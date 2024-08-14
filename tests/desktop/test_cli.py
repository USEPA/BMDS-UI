import shlex
import subprocess
import sys

from bmds_ui import __version__
from bmds_ui.desktop.cli import main


def test_version(capsys):
    sys.argv = ["bmds-server", "--version"]
    main()
    captured = capsys.readouterr()
    assert __version__ in captured.out


def test_main():
    commands = [shlex.quote(sys.executable), "-m", "bmds_ui", "--version"]
    resp = subprocess.run(commands, capture_output=True)  # noqa: S603
    assert __version__ in resp.stdout.decode()
