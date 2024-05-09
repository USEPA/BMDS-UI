from pathlib import Path
from typing import Any

from django.utils.text import slugify
from textual import on
from textual.app import ComposeResult
from textual.containers import Grid, Horizontal
from textual.reactive import reactive
from textual.screen import ModalScreen
from textual.validation import Function
from textual.widget import Widget
from textual.widgets import Button, Input, Label

from ..config import Config, Database


def str_exists(value: str):
    return len(value.strip()) > 0


def path_exists(value: str):
    resolved = Path(value).expanduser().resolve()
    if len(str(resolved)) == 0:
        return False
    return resolved.exists() and not resolved.is_file()


def file_valid(value: str):
    if not value.endswith(".sqlite3") and not value.endswith(".sqlite"):
        return False
    stemmed = Path(value).stem
    if len(stemmed) == 0:
        return False
    return slugify(stemmed) == stemmed


class NullWidget(Widget):
    DEFAULT_CSS = """
    NullWidget {
        display: none;
    }
    """

    def compose(self) -> ComposeResult:
        yield Label("")


class FormError(Widget):
    message = reactive("", recompose=True)

    def compose(self) -> ComposeResult:
        yield Label(self.message)


class DatabaseFormModel(ModalScreen):
    """Modal with a dialog to quit."""

    def __init__(self, *args, **kw):
        self.db_idx: int | None = kw.pop("db_idx", None)
        self.db: Database | None = kw.pop("db", None)
        super().__init__(*args, **kw)

    def get_db_value(self, attr: str, default: Any):
        return getattr(self.db, attr) if self.db else default

    def compose(self) -> ComposeResult:
        save_btn = (
            Button("Update", variant="success", id="db-update")
            if self.db
            else Button("Create", variant="success", id="db-create")
        )
        delete_btn = Button("Delete", variant="error", id="db-delete") if self.db else NullWidget()
        path = self.get_db_value("path", None)
        yield Grid(
            Label("Name (required)"),
            Input(
                value=self.get_db_value("name", ""),
                type="text",
                id="name",
                validators=[Function(str_exists)],
            ),
            Label("Path (must exist)"),
            Input(
                value=str(path.parent) if path else "",
                type="text",
                id="path",
                validators=[Function(path_exists)],
            ),
            Label("Filename (must end in .sqlite)"),
            Input(
                value=path.name if path else "",
                type="text",
                id="filename",
                validators=[Function(file_valid)],
            ),
            Label("Description"),
            Input(value=self.get_db_value("description", ""), type="text", id="description"),
            FormError(),
            Horizontal(
                save_btn,
                delete_btn,
                Button("Cancel", variant="primary", id="db-edit-cancel"),
            ),
        )

    @on(Button.Pressed, "#db-create")
    def on_db_create(self) -> None:
        name = self.query_one("#name").value
        path = self.query_one("#path").value
        db = self.query_one("#filename").value
        description = self.query_one("#description").value
        if not all((str_exists(name), path_exists(path), file_valid(db))):
            self.query_one(FormError).message = "An error occurred."
            return

        db_path = (Path(path).expanduser().resolve() / db).absolute()
        if db_path.exists():
            message = f"Cannot create - database already exists: {db_path}"
            self.query_one(FormError).message = message
            return

        db = Database(
            name=name,
            description=description,
            path=db_path,
        )
        config = Config.get()
        config.databases.insert(0, db)
        Config.sync()
        self.app.pop_screen()  # TODO - update the original list view?

    @on(Button.Pressed, "#db-update")
    def on_db_update(self) -> None:
        name = self.query_one("#name").value
        path = self.query_one("#path").value
        db = self.query_one("#filename").value
        description = self.query_one("#description").value
        if not all((str_exists(name), path_exists(path), file_valid(db))):
            self.query_one(FormError).message = "An error occurred."
            return

        db_path = (Path(path).expanduser().resolve() / db).absolute()
        if not db_path.exists():
            message = f"Cannot update - database does not exists: {db_path}"
            self.query_one(FormError).message = message
            return

        self.db: Database
        self.db.name = name
        self.db.path = Path(path) / db
        self.db.description = description
        config = Config.get()
        config.databases[self.db_idx] = self.db
        Config.sync()
        self.app.pop_screen()  # TODO - update the original list view?

    @on(Button.Pressed, "#db-delete")
    def on_db_delete(self) -> None:
        config = Config.get()
        config.databases.pop(self.db_idx)
        Config.sync()
        self.app.pop_screen()  # TODO - update the original list view?

    @on(Button.Pressed, "#db-edit-cancel")
    def on_db_create_cancel(self) -> None:
        self.app.pop_screen()
