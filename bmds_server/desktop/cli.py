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
from textual.screen import ModalScreen
from textual.validation import Length, ValidationResult, Validator
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


class UpdateModal(ModalScreen):
    """Screen with a dialog to check for updates."""

    @on(Button.Pressed, "#btn-update-download")
    def get_update(self):
        # do something here to download/go to site?
        ...

    # TODO: check for udates
    def compose(self) -> ComposeResult:
        yield Grid(
            Label(
                f"Check for Updates: {version('bmds_server')}", id="modal-update-lbl"
            ),
            # Button("Cancel", variant="primary", id="btn-update-download"),
            Button("Cancel", variant="primary", id="btn-update-cancel"),
            id="update-modal",
        )

    def on_button_pressed(self, event: Button.Pressed) -> None:
        if event.button.id == "btn-update-cancel":
            self.app.pop_screen()


class FNValidator(Validator):
    """Validate Name"""

    # not use Regex() validator cause of button active/disabled?

    def __init__(self, cls):
        self.cls = cls

    def validate(self, value: str) -> ValidationResult:
        if self.is_valid(value):
            btn = self.cls.query_one("#btn-save-fn")
            btn.disabled = False
            return self.success()

        else:
            return self.failure("Invalid character in filename.")

    @staticmethod
    def is_valid(value: str) -> bool:
        # not very strict, more complex regex
        # \A(?!(?:COM[0-9]|CON|LPT[0-9]|NUL|PRN|AUX|com[0-9]|con|lpt[0-9]|nul|prn|aux)|\s|[\.]{2,})[^\\\/:*"?<>|]{1,254}(?<![\s\.])\z
        if re.match(r"^[a-zA-Z0-9\-\s]+$", value) is not None:
            return True
        else:
            return False


class DesktopConfig(BaseModel):
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
        host = self.app.config.host
        port = self.app.config.port
        self.started = not self.started
        self.widget.label = self.LABEL[self.started]
        if self.started:
            os.environ["BMDS_HOME"] = self.app.config.path
            os.environ["BMDS_DB"] = str(
                Path(get_data_folder()) / get_project_filename()
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

    def reload(self):
        self.query_one(ConfigTree).reload()

    @on(Button.Pressed, "#btn-path-parent")
    def btn_path_parent(self):
        # move up one dir, reload tree
        ...

    @on(Button.Pressed, "#btn-save-dir")
    def btn_update_config(self, event: Button.Pressed) -> None:
        _selected = self.query_one("#disp-selected").renderable.__str__()
        if Path(_selected).is_dir():
            self.change_config(self.query_one("#disp-selected").renderable, kind="dir")
        if Path(_selected).is_file():
            # Select different project/db
            self.change_config(
                PurePath(self.query_one("#disp-selected").renderable.__str__()).name,
                kind="file",
            )

    def compose(self) -> ComposeResult:
        yield Button("<<", id="btn-path-parent")
        yield Label("Selected Folder:")
        yield Static(
            str(get_data_folder()), id="disp-selected", classes="disp-selected"
        )
        yield ConfigTree(
            id="config-tree", path=Path(get_data_folder()), classes="config-tree"
        )
        with Horizontal(classes="save-btns"):
            yield Button("Select Directory / DB", id="btn-save-dir", classes="save")

    def on_directory_tree_directory_selected(self, DirectorySelected):
        self.query_one("#disp-selected").update(rf"{DirectorySelected.path!s}")

    def on_directory_tree_file_selected(self, FileSelected):
        self.query_one("#disp-selected").update(rf"{FileSelected.path!s}")

    def change_config(self, value, kind):
        config = load_config()

        try:
            if kind == "dir":
                config["desktop"]["directory"] = str(value)
                msg = ["New project directory selected.", "Directory Updated"]
            else:
                config["desktop"]["file_name"] = str(value)
                msg = [f"{value} project selected.", "Data Source Updated"]
            with open(Path(APP_ROOT / "config.ini"), "w") as configfile:
                config.write(configfile)
            self.notify(
                f"{msg[0]}",
                title=f"{msg[1]}",
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

    # TODO: fix input validation/clear it after save
    # TODO: when input is empty, clear validation result

    # TODO: db not being selected/run right

    @on(Button.Pressed, "#btn-save-fn")
    def btn_create_project(self, event: Button.Pressed) -> None:
        self.create_project()

    @on(Input.Changed, "#input-filename")
    def show_invalid_reasons(self, event: Input.Changed) -> None:
        if event.validation_result:
            if not event.validation_result.is_valid:
                # Update UI to show the reasons why validation failed
                self.query_one("#disp-fn-validation").update(
                    event.validation_result.failure_descriptions[0]
                )
            else:
                self.query_one("#disp-fn-validation").update("")

    def compose(self) -> ComposeResult:
        yield Label("Current Filename:")
        yield Static(get_project_filename(), id="disp-fn")
        yield Static("Validation Status:")
        yield Label("", id="disp-fn-validation")
        yield Input(
            placeholder="Enter filename here...",
            id="input-filename",
            classes="input-filename",
            validators=[
                FNValidator(self),
                Length(
                    minimum=2,
                    failure_description="Filename must be two or more characters.",
                ),
            ],
        )
        with Horizontal(classes="save-btns"):
            yield Button(
                "save", id="btn-save-fn", classes="btn-auto save", disabled=True
            )

    def create_project(self):
        db_name = self.query_one(Input).value + ".sqlite3"
        config = load_config()
        config["desktop"]["file_name"] = str(db_name)
        cf = Path(get_data_folder()) / db_name

        try:
            cf.touch()
            with open(Path(APP_ROOT / "config.ini"), "w") as configfile:
                config.write(configfile)
            self.query_one("#disp-fn").update(get_project_filename())
            self.query_one("#input-filename").clear()
            self.notify(
                f"{db_name} : project created.",
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
    """Configuration Tab"""

    # Content Switch
    @on(Button.Pressed, "#dir-container,#fn-container")
    def btn_container_switch(self, event: Button.Pressed) -> None:
        self.query_one(ContentSwitcher).current = event.button.id
        self.query_one(DirectoryContainer).reload()

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
    """All Tabs"""

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
                    Label(f"[b]Port:[/b]\n  {self._app.config.port}", id="port"),
                    Label(f"[b]Host:[/b]\n  {self._app.config.host}", id="host"),
                    classes="app-box",
                    id="app-box",
                )

            with TabPane("Logging"):
                yield self._app.log_app.widget

            with TabPane("Config", id="config"):
                yield ConfigTab()

    @on(TabbedContent.TabActivated, "#tabs", tab="#app")
    def switch_to_app(self) -> None:
        self.query_one("#folder").update(f"[b]Data folder:[/b]\n  {get_data_folder()}")
        self.query_one("#project").update(
            f"[b]Data/Project:[/b]\n  {get_project_filename()}"
        )

    @on(TabbedContent.TabActivated, "#tabs", tab="#config")
    def switch_to_config(self) -> None:
        self.query_one(ConfigTree).reload()


class BmdsDesktop(App):
    """A Textual app for BMDS."""

    TITLE = f"BMDS Desktop (version {version('bmds_server')})"
    BINDINGS: ClassVar = [
        ("q", "quit", "Quit"),
        ("d", "toggle_dark", "Toggle dark mode"),
        ("s", "key_start", "Start/Stop BMDS Desktop"),
        ("u", "update_check", "Check for Updates"),
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
        with ScrollableContainer(classes="main"):
            yield Markdown((APP_ROOT / "content/top.md").read_text())
            yield self.tabs
        yield Footer()

    @on(Button.Pressed, "#runner-button")
    def toggle_runner(self):
        self.runner.toggle()

    def action_key_start(self):
        self.runner.toggle()

    def action_quit(self):
        """Exit the application."""
        self.push_screen(QuitModal())

    def action_toggle_dark(self):
        """An action to toggle dark mode."""
        self.dark = not self.dark

    def action_update_check(self):
        """Check for updates"""
        self.push_screen(UpdateModal())

    def on_mount(self) -> None:
        self.log_app.start()


def main():
    os.environ["DJANGO_SETTINGS_MODULE"] = "bmds_server.main.settings.desktop"
    app = BmdsDesktop()
    app.run()
