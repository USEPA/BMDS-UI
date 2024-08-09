import json
import os
import platform
import subprocess
import sys
from contextlib import redirect_stderr, redirect_stdout
from datetime import datetime
from pathlib import Path
from threading import Thread
from urllib.error import URLError
from urllib.parse import urlparse
from urllib.request import urlopen
from webbrowser import open_new_tab
from wsgiref.simple_server import WSGIServer, make_server

import django
import django.template
import django.template.engine
from django.conf import settings
from django.core.management import call_command
from packaging.version import Version, parse
from rich.console import Console
from whitenoise import WhiteNoise

from .. import __version__
from ..main.settings import desktop
from .config import Database, DesktopConfig, get_app_home, get_version_path
from .log import log, stream

PRERELEASE_URL = "https://gitlab.epa.gov/api/v4/projects/1508/packages/pypi/simple"


def sync_persistent_data():
    """Sync persistent data to database and static file path. We do this every time a database
    is created or an application starts, to make sure application state is consistent with files."""
    call_command("collectstatic", interactive=False, verbosity=3, stdout=stream, stderr=stream)
    call_command("migrate", interactive=False, verbosity=3, stdout=stream, stderr=stream)


def setup_django_environment(db: Database):
    """Set the active django database to the current path and setup the database."""
    app_home = get_app_home()

    desktop.DATABASES["default"]["NAME"] = str(db.path)

    version = get_version_path(__version__)
    public_data_root = app_home / "public" / version
    logs_path = app_home / "logs" / version

    public_data_root.mkdir(exist_ok=True, parents=False)
    logs_path.mkdir(exist_ok=True, parents=False)

    desktop.PUBLIC_DATA_ROOT = public_data_root
    desktop.STATIC_ROOT = public_data_root / "static"
    desktop.MEDIA_ROOT = public_data_root / "media"

    desktop.LOGS_PATH = logs_path
    desktop.LOGGING = desktop.setup_logging(logs_path)

    django.setup()


def create_django_db(db: Database):
    log.info(f"Creating {db}")
    setup_django_environment(db)
    sync_persistent_data()
    log.info(f"Creation successful {db}")


class AppThread(Thread):
    def __init__(self, config: DesktopConfig, db: Database, **kw):
        self.server: WSGIServer | None = None
        self.config = config
        self.db = db
        super().__init__(**kw)

    def _shutdown(self):
        # stop server from another thread to prevent deadlocks
        def _func(server: WSGIServer):
            server.shutdown()

        log.info("Stopping web application...")
        thread = Thread(target=_func, args=(self.server,))
        thread.start()
        log.info("Web application stopped")

    def run(self):
        setup_django_environment(self.db)
        sync_persistent_data()
        from ..main.wsgi import application

        with redirect_stdout(stream), redirect_stderr(stream):
            app = WhiteNoise(application, root=settings.PUBLIC_DATA_ROOT)
            self.server = make_server(self.config.server.host, self.config.server.port, app)
            url = f"http://{self.config.server.host}:{self.config.server.port}"
            log.info(f"Starting {url}")
            if not settings.IS_TESTING:
                open_new_tab(url)
            try:
                self.server.serve_forever()
            except KeyboardInterrupt:
                log.info(f"Stopping {url}")
            finally:
                self._shutdown()

    def stop(self):
        log.info("Stopping server")
        if self.server is not None:
            self._shutdown()


class AppRunner:
    def __init__(self):
        self.thread: AppThread | None = None

    def start(self, config: DesktopConfig, db: Database):
        if self.thread is None:
            log.info("Searching for free ports")
            config.server.find_free_port()
            log.info(f"Free port found: {config.server.port}")
            config.server.wait_till_free()
            log.info(f"Starting application on {config.server.web_address}")
            self.thread = AppThread(config=config, db=db, daemon=True)
            self.thread.start()

    def stop(self):
        if self.thread is not None:
            self.thread.stop()
            self.thread = None


def get_latest_version(package: str) -> tuple[datetime, Version]:
    raise ValueError("TODO - implement when we're clear to release")
    url = f"https://pypi.org/pypi/{package}/json"
    try:
        resp = urlopen(url, timeout=5)  # noqa: S310
    except URLError:
        parsed = urlparse(url)
        raise ValueError(
            f"Could not check latest version; unable to reach {parsed.scheme}://{parsed.netloc}."
        ) from URLError
    data = json.loads(resp.read().decode("utf-8"))
    latest_str = list(data["releases"].keys())[-1]
    upload_time = data["releases"][latest_str][0]["upload_time"]
    return datetime.fromisoformat(upload_time), parse(latest_str)


def get_installed_version() -> Version:
    return parse(__version__)


def get_version_message(current: Version, latest: Version, latest_date: datetime) -> str:
    if latest == current:
        return (
            f"You have the latest version installed, {latest} (released {latest_date:%b %d, %Y})."
        )
    elif current < latest:
        return f"There is a newer version available, {latest} (released {latest_date:%b %d, %Y})."
    elif current > latest:
        return f"You have a newer version than what's currently available, {latest} (released {latest_date:%b %d, %Y})."
    raise ValueError("Cannot compare versions")


def show_version():
    """Show the version for BMDS Desktop"""
    console = Console()
    console.print(__version__)


def _write_startup_script(app_path: Path, python_path: Path, template_text: str) -> str:
    from pybmds import __version__ as pybmds_version

    show_prerelease = any(v in pybmds_version for v in ["a", "b", "rc"])
    if not app_path.exists() or not python_path.exists():
        raise ValueError("Cannot write shortcut; items not found")
    engine = django.template.engine.Engine()
    template = django.template.Template(template_text, engine=engine)
    context = django.template.Context(
        {
            "prerelease_url": PRERELEASE_URL,
            "show_prerelease": show_prerelease,
            "bmds_desktop_path": app_path,
            "python_path": python_path,
            "python_version": platform.python_version(),
            "bmds_ui_version": __version__,
            "pybmds_version": pybmds_version,
        }
    )
    return template.render(context)


def create_shortcut():
    shortcut_path = Path(os.curdir).resolve() / "bmds-desktop"
    shortcut_path.mkdir(exist_ok=True)
    shortcut = shortcut_path / "bmds-desktop-manager.bat"
    system = platform.system()
    match system:
        case "Windows":
            python_path = Path(sys.executable)
            app_path = python_path.parent / "bmds-desktop.exe"
            if not app_path.exists():
                app_path = Path(sys.argv[0]).parent / "bmds-desktop.exe"
            template_text = (Path(__file__).parent / "templates/manager-bat.txt").read_text()
            script = _write_startup_script(app_path, python_path, template_text)
            shortcut.write_text(script)
        case "Darwin" | "Linux" | _:
            shortcut.write_text("TODO")

    console = Console()
    console.print("BMDS Desktop Manger Created:", style="magenta")
    console.print("----------------------------", style="magenta")
    console.print(shortcut, style="cyan")
    console.print("\nOpening this file will start BMDS Desktop.")
    console.print("You can move this file or create a shortcut to it.\n")
    resp = console.input(
        f'Would you like to open the folder to view "{shortcut.name}"? ([cyan]y/n[/cyan])  '
    )

    if resp.lower()[0] == "y":
        match system:
            case "Windows":
                os.startfile(str(shortcut_path))  # noqa: S606
            case "Darwin":
                subprocess.run(["open", str(shortcut_path)])  # noqa: S603, S607
            case "Linux" | _:
                console.print("Sorry, you'll have to open the folder manually.")
