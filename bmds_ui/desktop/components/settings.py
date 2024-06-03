from textual import on
from textual.validation import Number
from textual.widgets import Input, Label, Static

from ..config import Config


class Settings(Static):
    def compose(self):
        config = Config.get()
        yield Label("Host")
        yield Input(value=config.server.host, type="text", id="host")
        yield Label("Port")
        yield Input(
            value=str(config.server.port),
            type="integer",
            id="port",
            validators=[Number(minimum=1001, maximum=65536)],
        )

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
        if event.validation_result and event.validation_result.is_valid:
            config = Config.get()
            config.server.port = int(event.value)
            Config.sync()
