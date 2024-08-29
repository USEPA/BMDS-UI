import sqlite3
import tempfile
from pathlib import Path
from typing import Any

from pydantic import ValidationError
from textual import on, work
from textual.app import ComposeResult
from textual.containers import Grid, Horizontal
from textual.reactive import reactive
from textual.screen import ModalScreen
from textual.validation import Function
from textual.widget import Widget
from textual.widgets import Button, Input, Label, Markdown
from textual.worker import Worker, WorkerState

from ..actions import create_django_db
from ..config import Config, Database, db_suffixes
from ..log import log
from .utils import get_error_string


def str_exists(value: str):
    return len(value.strip()) > 0


def path_exists(value: str):
    resolved = Path(value).expanduser().resolve()
    if len(str(resolved)) == 0:
        return False
    return resolved.exists() and not resolved.is_file()


def file_valid(value: str):
    return any(value.endswith(suffix) for suffix in db_suffixes)


def additional_path_checks(path: Path):
    # Additional path checks. We don't add to the pydantic model validation because we don't
    # want to do this with every pydantic database model in config; but we do want these checks
    # when we create or update our configuration file.

    # check if we can even access the path
    try:
        path.exists()
    except PermissionError:
        raise ValueError(f"Permission denied: {path}") from None

    # create parent path if it doesn't already exist
    if not path.parent.exists():
        try:
            path.parent.mkdir(parents=True)
        except Exception:
            raise ValueError(f"Cannot create path {path.parent}") from None

    # check path is writable
    if not path.exists():
        try:
            with tempfile.NamedTemporaryFile(dir=path.parent, delete=True, mode="w") as f:
                f.write("test")
                f.flush()
        except Exception:
            raise ValueError(f"Cannot write to {path.parent}") from None

    # check existing database is loadable and writeable
    if path.exists():
        try:
            conn = sqlite3.connect(path)
            cursor = conn.cursor()
            cursor.execute("CREATE TEMP TABLE test_writable (id INTEGER)")
            conn.commit()
            conn.close()
        except (sqlite3.DatabaseError, sqlite3.OperationalError):
            raise ValueError(f"Cannot edit database {path}. Is this a sqlite database?") from None


def check_duplicates(dbs: list[Database], db: Database):
    duplicate = next((el for el in dbs if el.id != db.id and el.path == db.path), None)
    if duplicate:
        raise ValueError(
            f"An existing project ({duplicate.name}) already exists with this filename: {db.path}"
        )

    duplicate = next((el for el in dbs if el.id != db.id and el.name == db.name), None)
    if duplicate:
        raise ValueError(f"An existing project already exists with this name: {db.name}")


class NullWidget(Widget):
    DEFAULT_CSS = """
    NullWidget {
      display: none;
    }
    """

    def compose(self) -> ComposeResult:
        yield Label("")


class FormError(Widget):
    DEFAULT_CSS = """
    .has-error {
      background: $error;
      color: white;
      width: 100%;
      padding: 0 3;
    }
    """

    message = reactive("", recompose=True)

    def compose(self) -> ComposeResult:
        yield Label(self.message, expand=True, classes="has-error" if len(self.message) > 0 else "")


class DatabaseFormModel(ModalScreen):
    """Modal with a dialog to quit."""

    DEFAULT_CSS = """
    DatabaseFormModel {
      align: center middle;
    }
    DatabaseFormModel .subheader {
      background: $primary;
      color: white;
      width: 100%;
      padding: 0 3;
      margin: 0 0 1 0;
    }
    DatabaseFormModel Label {
      padding: 1 0 0 1;
    }
    DatabaseFormModel #grid-db-form {
      grid-size: 4;
      padding: 0;
      width: 90;
      height: 30;
      border: thick $background 80%;
      background: $surface;
    }
    DatabaseFormModel Input {
      column-span: 3;
    }
    DatabaseFormModel .btn-holder {
      align: center middle;
    }
    DatabaseFormModel .btn-holder Button {
      width: 25%;
      margin: 0 5;
    }
    """

    def __init__(self, *args, db: Database | None, **kw):
        kw.setdefault("name", "db_form")
        self.db: Database | None = db
        super().__init__(*args, **kw)

    def get_db_value(self, attr: str, default: Any):
        return getattr(self.db, attr) if self.db else default

    def compose(self) -> ComposeResult:
        btn_label = "Update" if self.db else "Create"
        btn_id = "db-update" if self.db else "db-create"
        save_btn = Button(btn_label, variant="primary", id=btn_id)
        delete_btn = Button("Delete", variant="error", id="db-delete") if self.db else NullWidget()
        path = self.get_db_value("path", None)
        yield Grid(
            Markdown(
                f"**{btn_label} Project**: A project contains all analyses in a single file. Within a project, you can create stars and labels to help organize analyses.",
                classes="subheader span4",
            ),
            Label("Name (required)"),
            Input(
                value=self.get_db_value("name", "My Database"),
                type="text",
                id="name",
                validators=[Function(str_exists)],
            ),
            Label("Path (must exist)"),
            Input(
                value=str(path.parent) if path else str(Path("~").expanduser().resolve()),
                type="text",
                id="path",
                validators=[Function(path_exists)],
            ),
            Label("Filename (*.db)"),
            Input(
                value=path.name if path else "bmds-database.db",
                type="text",
                id="filename",
                validators=[Function(file_valid)],
            ),
            Label("Description"),
            Input(value=self.get_db_value("description", ""), type="text", id="description"),
            FormError(classes="span4"),
            Horizontal(
                save_btn,
                Button("Cancel", variant="default", id="db-edit-cancel"),
                delete_btn,
                classes="btn-holder span4",
                id="actions-row",
            ),
            id="grid-db-form",
        )

    def db_valid(self) -> Database:
        kw = dict(
            name=self.query_one("#name").value,
            description=self.query_one("#description").value,
            path=Path(self.query_one("#path").value) / self.query_one("#filename").value,
        )
        if self.db is None:
            db = Database(**kw)
        else:
            db = self.db.model_copy()
            for key, value in kw.items():
                setattr(db, key, value)
        additional_path_checks(db.path)
        check_duplicates(Config.get().databases, db)
        return db

    @on(Button.Pressed, "#db-create")
    async def on_db_create(self) -> None:
        try:
            db = self.db_valid()
        except (ValidationError, ValueError) as err:
            self.query_one(FormError).message = get_error_string(err)
            return

        config = Config.get()
        self._create_django_db(config, db)

    @work(exclusive=True, thread=True, group="modify-db")
    def _create_django_db(self, config, db):
        # sleeps are required for loading indicator to show/hide properly
        self.app.call_from_thread(self.set_loading, True)
        config.add_db(db)
        Config.sync()
        create_django_db(db)
        self.app.call_from_thread(self.set_loading, False)

    def on_worker_state_changed(self, event: Worker.StateChanged) -> None:
        """Called when the worker state changes."""
        if event.worker.group == "modify-db" and event.state == WorkerState.SUCCESS:
            self.dismiss(True)

    @on(Button.Pressed, "#db-update")
    async def on_db_update(self) -> None:
        try:
            db = self.db_valid()
        except (ValidationError, ValueError) as err:
            self.query_one(FormError).message = get_error_string(err)
            return

        self.db.name = db.name
        self.db.path = db.path
        self.db.description = db.description
        Config.sync()
        log.info(f"Config updated for {self.db}")
        self.dismiss(True)

    @on(Button.Pressed, "#db-delete")
    async def on_db_delete(self) -> None:
        config = Config.get()
        config.remove_db(self.db)
        Config.sync()
        log.info(f"Config removed for {self.db}")
        self.dismiss(True)

    @on(Button.Pressed, "#db-edit-cancel")
    def on_db_create_cancel(self) -> None:
        self.dismiss(False)

    def set_loading(self, status: bool):
        self.get_widget_by_id("actions-row").loading = status
