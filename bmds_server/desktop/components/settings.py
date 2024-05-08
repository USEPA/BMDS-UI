from textual import on
from textual.widgets import Input, Label, Static

from ..config import Config


class Settings(Static):
    def compose(self):
        config = Config.get()
        yield Label("Host")
        yield Input(value=config.server.host, type="text", id="host")
        yield Label("Port")
        yield Input(value=str(config.server.port), type="integer", id="port")

    @on(Input.Changed, "#host")
    def on_host_change(self, event: Input.Changed):
        text = event.value.strip()
        if len(text) == 0:
            return
        config = Config.get()
        config.server.host = event.value
        Config.sync()

    @on(Input.Changed, "#port")
    def on_port_change(self, event: Input.Changed):
        text = event.value.strip()
        if not text.isnumeric():
            return
        config = Config.get()
        config.server.port = int(text)
        Config.sync()
