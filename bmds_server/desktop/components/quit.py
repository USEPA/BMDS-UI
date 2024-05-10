from textual import on
from textual.app import ComposeResult
from textual.containers import Grid
from textual.screen import ModalScreen
from textual.widgets import Button, Label


class QuitModal(ModalScreen):
    """Modal with a dialog to quit."""

    DEFAULT_CSS = """
    QuitModal {
      align: center middle;
    }
    QuitModal Button {
      width: 100%;
    }
    QuitModal #quit-grid {
      grid-size: 2;
      grid-gutter: 1 2;
      grid-rows: 1fr 3;
      padding: 0 1;
      width: 60;
      height: 11;
      border: thick $background 80%;
      background: $surface;
    }
    QuitModal #quit-text {
      column-span: 2;
      height: 1fr;
      width: 1fr;
      content-align: center middle;
    }
    """

    def compose(self) -> ComposeResult:
        yield Grid(
            Label("Are you sure you want to exit?", id="quit-text"),
            Button("Exit", variant="error", id="quit-yes"),
            Button("Cancel", variant="default", id="quit-no"),
            id="quit-grid",
        )

    @on(Button.Pressed, "#quit-yes")
    def on_exit_app(self) -> None:
        self.app.exit()

    @on(Button.Pressed, "#quit-no")
    def on_cancel_app(self) -> None:
        self.app.pop_screen()
