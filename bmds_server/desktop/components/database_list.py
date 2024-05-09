from textual.widgets import Button, Label, Static

from ..config import Config
from .database_item import DatabaseItem


class DatabaseList(Static):
    def compose(self):
        config = Config.get()
        yield Button(label="Create", variant="success", id="create-db")
        if len(config.databases) == 0:
            yield Label("No databases exist! Create one!")
        for idx, db in enumerate(config.databases):
            yield DatabaseItem(db=db, classes="db_item")
