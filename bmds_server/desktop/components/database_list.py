from textual import on
from textual.containers import Horizontal
from textual.widgets import Button, Label, Static

from ..config import Config
from .database_form import DatabaseFormModel
from .database_item import DatabaseItem
from .utils import refresh


class DatabaseList(Static):
    DEFAULT_CSS = """
    DatabaseList #create-db {
      padding: 0;
      margin-right: 1;
    }
    """

    def compose(self):
        config = Config.get()
        with Horizontal(classes="align-right"):
            yield Button(label="Create", variant="success", id="create-db")
        if len(config.databases) == 0:
            yield Label("No databases exist! Create one!")
        for db in config.databases:
            yield DatabaseItem(db=db, classes="db_item")

    @on(Button.Pressed, "#create-db")
    def on_create_db(self) -> None:
        self.app.push_screen(DatabaseFormModel(db=None), lambda status: refresh(status, self.app))
