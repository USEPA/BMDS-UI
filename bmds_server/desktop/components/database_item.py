from textual import on
from textual.containers import Horizontal, Vertical
from textual.widgets import Button, Label, Static

from ..config import Database
from .database_form import DatabaseFormModel


class DatabaseItem(Static):
    DEFAULT_CSS = """
    .hidden {
        display: none;
    }
    DatabaseItem {
        height: 7;
        border: solid green;
    }
    DatabaseItem.active {
        background: green 20%;
        border: solid green;
    }
    """

    def __init__(self, *args, db_idx: int, db: Database, **kw):
        self.db_idx = db_idx
        self.db = db
        super().__init__(*args, **kw)

    def compose(self):
        with Horizontal():
            with Vertical():
                yield Label(f"Name: {self.db.name}")
                yield Label(f"Description: {self.db.description}")
                yield Label(f"Last accessed: {self.db.last_accessed}")
                yield Label(f"Location: {self.db.path}")
            yield Button("Edit", variant="default", classes="db-edit")
            yield Button("Start", variant="success", classes="db-start")
            yield Button("Stop", variant="error", classes="db-stop hidden")

    @on(Button.Pressed, ".db-edit")
    def on_db_edit(self) -> None:
        self.app.push_screen(DatabaseFormModel(db_idx=self.db_idx, db=self.db))

    @on(Button.Pressed, ".db-start")
    def on_db_start(self) -> None:
        self.query_one("Button.db-stop").remove_class("hidden")
        self.app.query("Button.db-edit").add_class("hidden")
        self.app.query("Button.db-start").add_class("hidden")
        self.add_class("active")

    @on(Button.Pressed, ".db-stop")
    def on_db_stop(self) -> None:
        self.query_one("Button.db-stop").add_class("hidden")
        self.app.query("Button.db-edit").remove_class("hidden")
        self.app.query("Button.db-start").remove_class("hidden")
        self.remove_class("active")
