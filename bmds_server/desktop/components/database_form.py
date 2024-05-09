from pathlib import Path

from django.utils.text import slugify
from textual import on
from textual.app import ComposeResult
from textual.containers import Grid
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


class FormError(Widget):
    message = reactive("", recompose=True)

    def compose(self) -> ComposeResult:
        yield Label(self.message)


class CreateDatabaseModel(ModalScreen):
    """Modal with a dialog to quit."""

    def compose(self) -> ComposeResult:
        yield Grid(
            Label("Name (required)"),
            Input(type="text", id="name", validators=[Function(str_exists)]),
            Label("Path (must exist)"),
            Input(type="text", id="path", validators=[Function(path_exists)]),
            Label("Filename (must end in .sqlite)"),
            Input(type="text", id="filename", validators=[Function(file_valid)]),
            Label("Description"),
            Input(type="text", id="description"),
            FormError(),
            Button("Create", variant="success", id="db-create"),
            Button("Cancel", variant="primary", id="db-create-cancel"),
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
        self.app.pop_screen()

    @on(Button.Pressed, "#db-create-cancel")
    def on_db_create_cancel(self) -> None:
        self.app.pop_screen()
