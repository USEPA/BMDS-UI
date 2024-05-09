from textual.widgets import Button, Static

from .database_item import DatabaseItem


class DatabaseList(Static):
    def compose(self):
        yield Button(label="Create", variant="success", id="create-db")
        yield DatabaseItem()
        yield DatabaseItem()
        yield DatabaseItem()
