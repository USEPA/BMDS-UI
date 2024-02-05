import logging
import os
from contextlib import redirect_stderr, redirect_stdout
from importlib.metadata import version
from io import StringIO
from pathlib import Path
from threading import Thread
from time import sleep
from typing import ClassVar
from webbrowser import open_new_tab
from wsgiref.simple_server import WSGIServer, make_server

from django.conf import settings
from django.core.management import call_command
from pydantic import BaseModel, Field
from textual import on
from textual.app import App, ComposeResult
from textual.containers import Container, ScrollableContainer
from textual.widgets import (
    Button,
    Footer,
    Header,
    Label,
    Log,
    Markdown,
    Static,
    TabbedContent,
    TabPane,
)
from whitenoise import WhiteNoise

from ..main.constants import get_app_home

logger = logging.getLogger(__name__)

ROOT = Path(__file__).parent


def data_folder() -> Path:
    path = get_app_home()
    path.mkdir(parents=True, exist_ok=True)
    return path


class DesktopConfig(BaseModel):
    path: str = Field(default_factory=lambda: str(data_folder()))
    host: str = "127.0.0.1"
    port: int = 5555


class LogApp:
    def __init__(self, app):
        self.stream = StringIO()
        self.handler = logging.StreamHandler(self.stream)
        self.widget = Log(id="log")
        self.thread = Thread(target=self._run, daemon=True)

    def add_handler(self):
        logger = logging.getLogger()
        logger.addHandler(self.handler)
        logger.setLevel(logging.INFO)

    def start(self):
        self.add_handler()
        self.thread.start()

    def _run(self):
        while True:
            if log_contents := self.stream.getvalue().strip():
                self.stream.truncate(0)
                self.widget.write(log_contents)
            sleep(1)


class AppThread(Thread):
    def __init__(self, stream: StringIO, host="127.0.0.1", port=5555, **kw):
        self.stream = stream
        self.host = host
        self.port = port
        self.server: WSGIServer | None = None
        super().__init__(**kw)

    def run(self):
        import django

        django.setup()

        from ..main.wsgi import application as django_app

        self.stream.write("\nStart collectstatic\n")
        call_command(
            "collectstatic", interactive=False, verbosity=3, stdout=self.stream, stderr=self.stream
        )
        self.stream.write("\nEnd collectstatic\n")

        self.stream.write("\nStart migration\n")
        call_command(
            "migrate", interactive=False, verbosity=3, stdout=self.stream, stderr=self.stream
        )
        self.stream.write("\nEnd migration\n")

        with redirect_stdout(self.stream), redirect_stderr(self.stream):
            application = WhiteNoise(django_app, root=settings.PUBLIC_DATA_ROOT)
            self.server = make_server(self.host, self.port, application)
            url = f"http://{self.host}:{self.port}"
            self.stream.write(f"\nStart {url}\n\n")
            open_new_tab(url)
            try:
                self.server.serve_forever()
            except KeyboardInterrupt:
                self.stream.write(f"\nStop {url}.\n")
            finally:
                self.server.shutdown()

    def stop(self):
        self.stream.write("\nStop server.\n")
        if isinstance(self.server, WSGIServer):
            self.server.shutdown()


class AppRunner:
    LABEL: ClassVar = {True: "Stop BMDS Desktop", False: "Start BMDS Desktop"}

    def __init__(self, app: "BmdsDesktop"):
        self.app = app
        self.started = False
        self.widget = Button(label=self.LABEL[self.started], id="runner-button", variant="primary")
        self.thread: AppThread | None = None

    def toggle(self):
        host = self.app.config.host
        port = self.app.config.port
        self.started = not self.started
        self.widget.label = self.LABEL[self.started]
        if self.started:
            os.environ["BMDS_HOME"] = self.app.config.path
            os.environ["BMDS_DB"] = str(Path(self.app.config.path) / "bmds.sqlite3")
            self.thread = AppThread(
                stream=self.app.log_app.stream,
                host=host,
                port=port,
                daemon=True,
            )
            self.thread.start()
        else:
            if self.thread:
                self.thread.stop()
                self.thread = None

    def start(self):
        self.thread.start()


class BmdsTabs(Static):
    def __init__(self, _app: "BmdsDesktop", **kw):
        self._app = _app
        super().__init__(**kw)

    def compose(self) -> ComposeResult:
        with TabbedContent(id="tabs"):
            with TabPane("Application", classes="app"):
                yield Container(
                    self._app.runner.widget,
                )
                yield Container(
                    Label(f"[b]Data folder:[/b]\n  {self._app.config.path}"),
                    Label(f"[b]Port:[/b]\n  {self._app.config.port}"),
                    Label(f"[b]Host:[/b]\n  {self._app.config.host}"),
                    classes="app-box",
                )

            with TabPane("Logging"):
                yield self._app.log_app.widget


class BmdsDesktop(App):
    """A Textual app for BMDS."""

    TITLE = f"BMDS Desktop (version {version('bmds_server')})"
    BINDINGS: ClassVar = [("q", "quit", "Quit"), ("d", "toggle_dark", "Toggle dark mode")]
    CSS_PATH = "content/app.css"

    def __init__(self, **kw):
        self.config = DesktopConfig()
        self.log_app = LogApp(self)
        self.runner = AppRunner(self)
        self.tabs = BmdsTabs(self)
        super().__init__(**kw)

    def compose(self) -> ComposeResult:
        """Create child widgets for the app."""
        yield Header()
        yield ScrollableContainer(
            Markdown((ROOT / "content/top.md").read_text()), self.tabs, classes="main"
        )
        yield Footer()

    @on(Button.Pressed, "#runner-button")
    def toggle_runner(self):
        self.runner.toggle()

    def action_quit(self):
        """Exit the application."""
        self.exit()

    def action_toggle_dark(self):
        """An action to toggle dark mode."""
        self.dark = not self.dark

    def on_mount(self) -> None:
        self.log_app.start()


def main():
    os.environ["DJANGO_SETTINGS_MODULE"] = "bmds_server.main.settings.desktop"
    app = BmdsDesktop()
    app.run()
