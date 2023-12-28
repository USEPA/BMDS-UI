import logging
import os
from collections.abc import Iterable
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
from textual.containers import Container, Horizontal, ScrollableContainer, Vertical
from textual.validation import ValidationResult, Validator
from textual.widgets import (
    Button,
    ContentSwitcher,
    DirectoryTree,
    Footer,
    Header,
    Input,
    Label,
    Log,
    Markdown,
    Rule,
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


class CustomValidator(Validator):
    def validate(self, value: str) -> ValidationResult:
        # """TODO"""
        # if self.value:
        return self.success()
        # else:
        #     return self.failure("message")


class DesktopConfig(BaseModel):
    path: str = Field(default_factory=lambda: str(data_folder()))
    host: str = "127.0.0.1"
    port: int = 5555

    # make reactive?

    # on_mount : set defaults?
    # watch/message handle to update
    # only in memory, how save?


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
            "collectstatic",
            interactive=False,
            verbosity=3,
            stdout=self.stream,
            stderr=self.stream,
        )
        self.stream.write("\nEnd collectstatic\n")

        self.stream.write("\nStart migration\n")
        call_command(
            "migrate",
            interactive=False,
            verbosity=3,
            stdout=self.stream,
            stderr=self.stream,
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
        self.widget = Button(
            label=self.LABEL[self.started], id="runner-button", variant="primary"
        )
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


class ConfigTree(DirectoryTree):
    """Directory Tree on Config tab"""

    _name = "Directory Tree"
    _next_callbacks = []
    _running = []
    # _classes = ["dir_tree"]

    def __init__(self, id, path):
        self._id = id
        self.path = path
        super().__init__(self.path)

    def filter_paths(self, paths: Iterable[Path]) -> Iterable[Path]:
        # Filter for folders & sqlite3 db's
        return [
            path for path in paths if path.is_dir() or path.name.endswith(".sqlite3")
        ]


class ConfigTab(Static):
    DEFAULT_PATH: ClassVar = ["./"]
    TABS: ClassVar = ["dir-container", "fn-container"]

    directory_tree = ConfigTree(id="config-tree", path=DEFAULT_PATH[0])
    s_d = Static(str(data_folder()), classes="selected-disp")
    dir_container = Container(id="dir-container", classes="dir-container")

    fn_container = Container(id="fn-container", classes="fn-container")
    fn_input = Input(
        placeholder="I'm an input box!",
        id="set-filename",
        classes="set-filename",
        validators=[CustomValidator()],
    )

    def on_button_pressed(self, event: Button.Pressed) -> None:
        if event.button.id in self.TABS:
            self.query_one(ContentSwitcher).current = event.button.id
        else:
            self.notify(
                f"{event.button.id}",
                title="notification title",
                severity="information",
            )

    def compose(self) -> ComposeResult:
        with Horizontal(classes="config-tab"):
            with Vertical(classes="config-btns"):
                yield Button("Change Directory", id="dir-container")
                yield Button("Change DB/Filename", id="fn-container")
            yield Rule(orientation="vertical")

            with ContentSwitcher(initial="dir-container"):
                with self.dir_container:
                    yield Label("Selected Folder:")
                    yield self.s_d
                    yield self.directory_tree
                    with Horizontal(classes="save-btns"):
                        yield Button("save", id="save-dir-btn", classes="btn-auto save")
                with self.fn_container:
                    yield Label("Current Filename:")
                    yield Static("I'm the filename!")
                    yield self.fn_input
                    with Horizontal(classes="save-btns"):
                        yield Button("save", id="save-fn-btn", classes="btn-auto save")

    def on_directory_tree_directory_selected(self, DirectorySelected):
        self.s_d.update(rf"{get_app_home()!s}\{DirectorySelected.path!s}")

    # on_mount():
    # set change dir btn to active?


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

            with TabPane("Config"):
                yield ConfigTab()


class BmdsDesktop(App):
    """A Textual app for BMDS."""

    TITLE = f"BMDS Desktop (version {version('bmds_server')})"
    BINDINGS: ClassVar = [
        ("q", "quit", "Quit"),
        ("d", "toggle_dark", "Toggle dark mode"),
        ("s", "key_start", "Start/Stop BMDS Desktop"),
    ]
    CSS_PATH = "content/app.tcss"

    def __init__(self, **kw):
        self.config = DesktopConfig()
        self.log_app = LogApp(self)
        self.runner = AppRunner(self)
        self.tabs = BmdsTabs(self)
        super().__init__(**kw)

    def compose(self) -> ComposeResult:
        """Create child widgets for the app."""
        yield Header()
        with Container(classes="main"):
            yield Markdown((ROOT / "content/top.md").read_text())
            yield self.tabs
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

    def action_key_start(self):
        # didnt work with "shift+s" ??
        self.runner.toggle()

    def on_mount(self) -> None:
        self.log_app.start()


def main():
    os.environ["DJANGO_SETTINGS_MODULE"] = "bmds_server.main.settings.desktop"
    app = BmdsDesktop()
    app.run()
