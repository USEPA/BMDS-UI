import configparser
import logging
import os
import re
from collections.abc import Iterable
from contextlib import redirect_stderr, redirect_stdout
from importlib.metadata import version
from io import StringIO
from pathlib import Path, PurePath
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
from textual.containers import (
    Container,
    Grid,
    Horizontal,
    ScrollableContainer,
    Vertical,
)
from textual.reactive import reactive
from textual.screen import ModalScreen
from textual.validation import Failure, Function, ValidationResult, Validator
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
    Pretty,
    Rule,
    Static,
    TabbedContent,
    TabPane,
)
from whitenoise import WhiteNoise

from ..main.constants import get_app_home

logger = logging.getLogger(__name__)

APP_ROOT = Path(__file__).parent


def load_config():
    config = configparser.ConfigParser()
    config.read(Path(APP_ROOT / "config.ini"))
    return config


def get_data_folder() -> Path:
    # Set default directory by OS
    config = load_config()
    if config["desktop"]["directory"] == "default":
        path = get_app_home()
        path.mkdir(parents=True, exist_ok=True)
        return path
    else:
        return config["desktop"]["directory"]


def get_project_filename() -> str:
    # file <-> db <-> project
    config = load_config()
    if config["desktop"]["file_name"] == "default":
        return "bmds.sqlite3"
    else:
        return config["desktop"]["file_name"]


class QuitModal(ModalScreen):
    """Screen with a dialog to quit."""

    def compose(self) -> ComposeResult:
        yield Grid(
            Label("Are you sure you want to quit?", id="modal-quit-question"),
            Button("Quit", variant="error", id="btn-modal-quit"),
            Button("Cancel", variant="primary", id="btn-modal-cancel"),
            id="quit-modal",
        )

    def on_button_pressed(self, event: Button.Pressed) -> None:
        if event.button.id == "btn-modal-quit":
            self.app.exit()
        else:
            self.app.pop_screen()


class FNValidator(Validator):
    # def describe_failure(self, failure: Failure) -> str | None:
    #     return super().describe_failure(failure)

    def validate(self, value: str) -> ValidationResult:
        if self.is_valid_fn(value):
            return self.success()
        else:
            return self.failure("Invalid character in filename.")

    @staticmethod
    def is_valid_fn(value: str) -> bool:
        # No .
        # \A(?!(?:COM[0-9]|CON|LPT[0-9]|NUL|PRN|AUX|com[0-9]|con|lpt[0-9]|nul|prn|aux)|\s|[\.]{2,})[^\\\/:*"?<>|]{1,254}(?<![\s\.])\z
        if re.match(r"^[a-zA-Z0-9\-\s]+$", value) is not None:
            return True
        else:
            return False


class DesktopConfig(BaseModel):
    # configparser r/w
    path: str = Field(default_factory=lambda: str(get_data_folder()))
    project: str = Field(default_factory=lambda: str(get_project_filename()))
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
        # host = self.app.config.host
        # port = self.app.config.port

        host = DesktopConfig().host
        port = DesktopConfig().port

        self.started = not self.started
        self.widget.label = self.LABEL[self.started]
        if self.started:
            os.environ["BMDS_HOME"] = DesktopConfig().path
            os.environ["BMDS_DB"] = str(
                Path(DesktopConfig().path) / DesktopConfig().project
            )
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

    def __init__(self, **kw):
        super().__init__(**kw)

    def filter_paths(self, paths: Iterable[Path]) -> Iterable[Path]:
        # Filter for folders & sqlite3 db's
        return [
            path for path in paths if path.is_dir() or path.name.endswith(".sqlite3")
        ]


class DirectoryContainer(Container):
    """Directory"""

    # TODO: Directions/Help Text

    # .parent button?

    @on(Button.Pressed, "#btn-save-dir")
    def zzz_btn(self, event: Button.Pressed) -> None:
        foo = self.query_one("#selected-disp").renderable.__str__()
        if Path(foo).is_dir():
            self.save_dir(self.query_one("#selected-disp").renderable)
        if Path(foo).is_file():
            # Select different project/db
            self.save_file(
                PurePath(self.query_one("#selected-disp").renderable.__str__()).name
            )

    def compose(self) -> ComposeResult:
        yield Button("<<", id="path-parent-btn")
        yield Label("Selected Folder:")
        yield Static(
            str(get_data_folder()), id="selected-disp", classes="selected-disp"
        )
        yield ConfigTree(
            id="config-tree", path=Path(get_data_folder()), classes="config-tree"
        )
        with Horizontal(classes="save-btns"):
            yield Button("Select Directory / DB", id="btn-save-dir", classes="save")

    def on_directory_tree_directory_selected(self, DirectorySelected):
        self.query_one("#selected-disp").update(rf"{DirectorySelected.path!s}")

    def on_directory_tree_file_selected(self, FileSelected):
        self.query_one("#selected-disp").update(rf"{FileSelected.path!s}")

    def save_dir(self, directory):
        config = load_config()
        config["desktop"]["directory"] = str(directory)

        try:
            with open(Path(APP_ROOT / "config.ini"), "w") as configfile:
                config.write(configfile)
            self.notify(
                "New project directory selected.",
                title="Directory Updated",
                severity="information",
            )
            self.query_one(ConfigTree).reload()
        except Exception as e:
            self.notify(
                f"{e}",
                title="ERROR",
                severity="error",
            )

    def save_file(self, file_name):
        config = load_config()
        config["desktop"]["file_name"] = str(file_name)

        try:
            with open(Path(APP_ROOT / "config.ini"), "w") as configfile:
                config.write(configfile)
            self.notify(
                f"{file_name} project selected.",
                title="Data Source Updated",
                severity="information",
            )
            self.query_one(ConfigTree).reload()
        except Exception as e:
            self.notify(
                f"{e}",
                title="ERROR",
                severity="error",
            )


class FileNameContainer(Container):
    """Filename"""

    #  CURRENT_FILENAME
    @on(Button.Pressed, "#btn-save-fn")
    def zzz_btn(self, event: Button.Pressed) -> None:
        self.create_project()

    @on(Input.Changed, "#input-filename")
    def show_invalid_reasons(self, event: Input.Changed) -> None:
        # Update UI to show the reasons why validation failed
        if not event.validation_result.is_valid:
            self.query_one(Pretty).update(event.validation_result.failure_descriptions)
            # do name saving stuff
        else:
            self.query_one(Pretty).update([])

    def compose(self) -> ComposeResult:
        # disable button until valid
        yield Label("Current Filename:")
        yield Static(get_project_filename())
        yield Label("Validation Status:")
        # TODO: other kind of display that doesnt show an empty list?
        yield Pretty([])
        yield Input(
            placeholder="Enter filename here...",
            id="input-filename",
            classes="input-filename",
            validators=[
                FNValidator(),
            ],
        )
        with Horizontal(classes="save-btns"):
            yield Button("save", id="btn-save-fn", classes="btn-auto save")

    def create_project(self):
        zzz = self.query_one(Input).value
        zzz = zzz + ".sqlite3"

        config = load_config()
        config["desktop"]["file_name"] = str(zzz)

        try:
            with open(Path(APP_ROOT / "config.ini"), "w") as configfile:
                config.write(configfile)
            # update current filename
            self.notify(
                "New project created.",
                title="Project Created",
                severity="information",
            )
        except Exception as e:
            self.notify(
                f"{e}",
                title="ERROR",
                severity="error",
            )


class ConfigTab(Static):
    # Content Switch
    @on(Button.Pressed, "#dir-container,#fn-container")
    def container_btn_press(self, event: Button.Pressed) -> None:
        self.query_one(ContentSwitcher).current = event.button.id

    def compose(self) -> ComposeResult:
        with Horizontal(classes="config-tab"):
            with Vertical(classes="config-btns"):
                yield Button(
                    "Change Directory / Project", id="dir-container", classes="btn-auto"
                )
                yield Button(
                    "Create New Project", id="fn-container", classes="btn-auto"
                )
            yield Rule(orientation="vertical")

            with ContentSwitcher(initial="dir-container"):
                yield DirectoryContainer(id="dir-container", classes="dir-container")
                yield FileNameContainer(id="fn-container", classes="fn-container")


class BmdsTabs(Static):
    def __init__(self, _app: "BmdsDesktop", **kw):
        self._app = _app
        super().__init__(**kw)

    def compose(self) -> ComposeResult:
        with TabbedContent(id="tabs"):
            with TabPane("Application", id="app", classes="app"):
                yield Container(
                    self._app.runner.widget,
                )
                yield Container(
                    Label("", id="folder"),
                    Label("", id="project"),
                    Label(f"[b]Port:[/b]\n  {DesktopConfig().port}", id="port"),
                    Label(f"[b]Host:[/b]\n  {DesktopConfig().host}", id="host"),
                    classes="app-box",
                    id="app-box",
                )

            with TabPane("Logging"):
                yield self._app.log_app.widget

            with TabPane("Config"):
                yield ConfigTab()

    @on(TabbedContent.TabActivated, "#tabs", tab="#app")
    def switch_to_app(self) -> None:
        self.query_one("#folder").update(f"[b]Data folder:[/b]\n  {get_data_folder()}")
        self.query_one("#project").update(
            f"[b]Data/Project:[/b]\n  {get_project_filename()}"
        )


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
        # self.config = DesktopConfig()
        self.log_app = LogApp(self)
        self.runner = AppRunner(self)
        self.tabs = BmdsTabs(self)
        super().__init__(**kw)

    def compose(self) -> ComposeResult:
        """Create child widgets for the app."""
        yield Header()
        with ScrollableContainer(classes="main"):
            yield Markdown((APP_ROOT / "content/top.md").read_text())
            yield self.tabs
        yield Footer()

    @on(Button.Pressed, "#runner-button")
    def toggle_runner(self):
        self.runner.toggle()

    def action_quit(self):
        """Exit the application."""
        self.push_screen(QuitModal())

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
