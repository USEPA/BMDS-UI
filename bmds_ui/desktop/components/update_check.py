from textual import on
from textual.app import ComposeResult
from textual.containers import Container, Horizontal
from textual.reactive import reactive
from textual.screen import ModalScreen
from textual.widget import Widget
from textual.widgets import Button, Label, Markdown

from .. import content


class UpdateTextWidget(Widget):
    text = reactive("", recompose=True)

    def compose(self) -> ComposeResult:
        yield Markdown(self.text)


class CheckForUpdatesModal(ModalScreen):
    DEFAULT_CSS = """
    CheckForUpdatesModal {
      align: center middle;
    }
    CheckForUpdatesModal #container {
      background: $surface;
      border: thick $background 80%;
      height: 18;
      width: 60;
    }
    CheckForUpdatesModal .subheader {
      background: $primary;
      color: white;
      width: 100%;
      height: 3;
      content-align: center middle;
    }
    CheckForUpdatesModal #content {
      height: 5;
      align: center middle;
      margin: 2 0;
    }
    CheckForUpdatesModal #btn-holder {
      align: center bottom;
      content-align: center middle;
    }
    CheckForUpdatesModal .btn {
      width: 13;
      margin: 0 8;
    }
    """

    def compose(self) -> ComposeResult:
        yield Container(
            Label("Check if a new version is available.", classes="subheader"),
            UpdateTextWidget(id="content"),
            Horizontal(
                Button("Check", variant="primary", classes="btn", id="btn-update-download"),
                Button("Close", variant="default", classes="btn", id="btn-update-cancel"),
                id="btn-holder",
            ),
            id="container",
        )

    def on_mount(self) -> None:
        self.query_one(UpdateTextWidget).text = content.version_check(check=False)

    @on(Button.Pressed, "#btn-update-download")
    def on_update_download(self):
        self.query_one(UpdateTextWidget).text = content.version_check(check=True)

    @on(Button.Pressed, "#btn-update-cancel")
    def on_cancel(self):
        self.app.pop_screen()
