from textual.widgets import Label, Static

from .database_item import DatabaseItem


class DatabaseList(Static):
    def compose(self):
        yield Label("I am a database list")
        yield DatabaseItem()
        yield DatabaseItem()
        yield DatabaseItem()
