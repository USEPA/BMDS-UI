from datetime import UTC, datetime

from textual import on
from textual.containers import Horizontal, Vertical
from textual.widgets import Button, Label, Static

from ..config import Config, Database
from .database_form import DatabaseFormModel
from .utils import refresh


def utc_to_local(timestamp: datetime):
    """timestamp is a UTC normalized timestamp"""
    now = datetime.now(UTC)
    day_diff = (now - timestamp).total_seconds() / (60 * 60 * 24)
    local = timestamp.astimezone(tz=None)
    if day_diff <= 1:
        return local.strftime("%I:%M %p")
    elif day_diff < 180:
        return local.strftime("%b %d")
    else:
        return local.strftime("%m/%d/%y")


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

    def __init__(self, *args, db: Database, **kw):
        self.db: Database = db
        super().__init__(*args, **kw)

    def compose(self):
        with Horizontal():
            with Vertical():
                yield Label(f"Name: {self.db.name}")
                yield Label(f"Description: {self.db.description}")
                yield Label(f"Last accessed: {utc_to_local(self.db.last_accessed)}")
                yield Label(f"Location: {self.db.path}")
            yield Button("Edit", variant="default", classes="db-edit")
            yield Button("Start", variant="success", classes="db-start")
            yield Button("Stop", variant="error", classes="db-stop hidden")

    @on(Button.Pressed, ".db-edit")
    def on_db_edit(self) -> None:
        self.app.push_screen(
            DatabaseFormModel(db=self.db), lambda status: refresh(status, self.app)
        )

    @on(Button.Pressed, ".db-start")
    def on_db_start(self) -> None:
        self.db.update_last_accessed()
        Config.sync()
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
