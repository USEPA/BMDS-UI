from textual.widgets import Label, Static


class DatabaseItem(Static):
    def compose(self):
        yield Label("I am a database item")
