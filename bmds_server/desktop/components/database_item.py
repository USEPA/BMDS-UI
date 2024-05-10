from datetime import UTC, datetime

from textual import on
from textual.containers import Horizontal, Vertical
from textual.widgets import Button, Label, Static

from ..config import Config, Database
from ..log import log
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
    DatabaseItem {
      height: 5;
      border: double $primary-lighten-2;
    }
    DatabaseItem.active {
      background: $primary 50%;
    }
    """

    def __init__(self, *args, db: Database, **kw):
        self.db: Database = db
        super().__init__(*args, **kw)

    def compose(self):
        with Horizontal():
            with Vertical():
                yield Label(f"[b][u]{self.db.name}[/u][/b] ({utc_to_local(self.db.last_accessed)})")
                yield Label(self.db.description)
                yield Label(str(self.db.path))
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
        log.info(f"Starting {self.db}")
        self.app.webapp.start(config=Config.get(), db=self.db)

    @on(Button.Pressed, ".db-stop")
    def on_db_stop(self) -> None:
        self.query_one("Button.db-stop").add_class("hidden")
        self.app.query("Button.db-edit").remove_class("hidden")
        self.app.query("Button.db-start").remove_class("hidden")
        self.remove_class("active")
        log.info(f"Stopping {self.db}")
        self.app.webapp.stop()
