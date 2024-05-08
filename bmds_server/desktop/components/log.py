from textual.widgets import Label, Static


class Log(Static):
    def compose(self):
        yield Label("I am the logs")
