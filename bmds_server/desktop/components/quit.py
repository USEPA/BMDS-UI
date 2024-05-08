from textual import on
from textual.app import ComposeResult
from textual.containers import Grid
from textual.screen import ModalScreen
from textual.widgets import Button, Label


class QuitModal(ModalScreen):
    """Modal with a dialog to quit."""

    def compose(self) -> ComposeResult:
        yield Grid(
            Label("Are you sure you want to quit?"),
            Button("Quit", variant="error", id="quit-yes"),
            Button("Cancel", variant="primary", id="quit-no"),
        )

    @on(Button.Pressed, "#quit-yes")
    def on_exit_app(self) -> None:
        self.app.exit()

    @on(Button.Pressed, "#quit-no")
    def on_cancel_app(self) -> None:
        self.app.pop_screen()
