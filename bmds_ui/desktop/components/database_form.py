from pathlib import Path
from typing import Any

from django.utils.text import slugify
from textual import on, work
from textual.app import ComposeResult
from textual.containers import Grid, Horizontal
from textual.reactive import reactive
from textual.screen import ModalScreen
from textual.validation import Function
from textual.widget import Widget
from textual.widgets import Button, Input, Label, Markdown

from ..actions import create_django_db
from ..config import Config, Database
from ..log import log


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
        self.db = db
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
            Label("Filename (*.sqlite)"),
            Input(
                value=path.name if path else "db.sqlite",
                type="text",
                id="filename",
                validators=[Function(file_valid)],
            ),
            Label("Description"),
            Input(value=self.get_db_value("description", ""), type="text", id="description"),
            FormError(classes="span4 error-text"),
            Horizontal(
                save_btn,
                Button("Cancel", variant="default", id="db-edit-cancel"),
                delete_btn,
                classes="btn-holder span4",
                id="actions-row",
            ),
            id="grid-db-form",
        )

    @on(Button.Pressed, "#db-create")
    async def on_db_create(self) -> None:
        name = self.query_one("#name").value
        path = self.query_one("#path").value
        db = self.query_one("#filename").value
        description = self.query_one("#description").value
        if not all((str_exists(name), path_exists(path), file_valid(db))):
            self.query_one(FormError).message = "An error occurred."
            return
        db_path = (Path(path).expanduser().resolve() / db).absolute()
        config = Config.get()
        db = Database(name=name, description=description, path=db_path)
        self._create_django_db(config, db)

    @work(exclusive=True, thread=True)
    def _create_django_db(self, config, db):
        # sleeps are required for loading indicator to show/hide properly
        self.app.call_from_thread(self.set_loading, True)
        config.add_db(db)
        Config.sync()
        create_django_db(db)
        self.app.call_from_thread(self.set_loading, False)
        self.app.call_from_thread(self.dismiss, True)

    @on(Button.Pressed, "#db-update")
    async def on_db_update(self) -> None:
        name = self.query_one("#name").value
        path = self.query_one("#path").value
        db = self.query_one("#filename").value
        description = self.query_one("#description").value
        if not all((str_exists(name), path_exists(path), file_valid(db))):
            self.query_one(FormError).message = "An error occurred."
            return

        db_path = (Path(path).expanduser().resolve() / db).absolute()
        if not db_path.exists():
            message = f"Database does not exist: {db_path}"
            self.query_one(FormError).message = message
            return

        self.db.name = name
        self.db.path = Path(path) / db
        self.db.description = description
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
