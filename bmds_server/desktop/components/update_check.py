from textual import on
from textual.app import ComposeResult
from textual.containers import Grid
from textual.reactive import reactive
from textual.screen import ModalScreen
from textual.widget import Widget
from textual.widgets import Button, Label

from .. import content


class UpdateTextWidget(Widget):
    text = reactive("", recompose=True)

    def compose(self) -> ComposeResult:
        yield Label(self.text)


class CheckForUpdatesModal(ModalScreen):
    DEFAULT_CSS = """
    CheckForUpdatesModal {
      align: center middle;
    }
    CheckForUpdatesModal Button {
      width: 100%;
    }
    CheckForUpdatesModal #update-grid {
      grid-size: 2;
      grid-gutter: 1 3;
      grid-rows: 1fr 3;
      padding: 0 1;
      width: 60;
      height: 15;
      border: thick $background 80%;
      background: $surface;
    }
    CheckForUpdatesModal .span2 {
      column-span: 2;
      height: 1fr;
      width: 1fr;
      content-align: center middle;
    }
    """

    def compose(self) -> ComposeResult:
        yield Grid(
            Label("Check online to see if a new version is available", classes="span2"),
            UpdateTextWidget(classes="span2"),
            Button("Check", variant="primary", id="btn-update-download"),
            Button("Cancel", variant="default", id="btn-update-cancel"),
            id="update-grid",
        )

    def on_mount(self) -> None:
        self.query_one(UpdateTextWidget).text = content.version_check(check=False)

    @on(Button.Pressed, "#btn-update-download")
    def on_update_download(self):
        self.query_one(UpdateTextWidget).text = content.version_check(check=True)

    @on(Button.Pressed, "#btn-update-cancel")
    def on_cancel(self):
        self.app.pop_screen()
