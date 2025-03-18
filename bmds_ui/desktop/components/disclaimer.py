from textual import on
from textual.app import ComposeResult
from textual.containers import Center, Container
from textual.screen import ModalScreen
from textual.widgets import Button, Label, Markdown

disclaimer_text = """This software/application has been approved for release by the U.S. Environmental Protection Agency (USEPA). Although the software has been subjected to rigorous review, the USEPA reserves the right to update the software as needed pursuant to further analysis and review. No warranty, expressed or implied, is made by the USEPA or the U.S. Government as to the functionality of the software and related material nor shall the fact of release constitute any such warranty. Furthermore, the software is released on condition that neither the USEPA nor the U.S. Government shall be held liable for any damages resulting from its authorized or unauthorized use."""


class DisclaimerModal(ModalScreen):
    """Modal with disclaimer."""

    DEFAULT_CSS = """
    DisclaimerModal {
      align: center middle;
    }
    DisclaimerModal Button {
      width: 50%;
    }
    DisclaimerModal #disclaimer-container {
      background: $surface;
      border: thick $background 80%;
      height: 22;
      width: 80;
    }
    DisclaimerModal #disclaimer-title {
      background: $primary;
      color: white;
      content-align: center middle;
      padding: 1 0;
      width: 100%;
    }
    DisclaimerModal #disclaimer-text {
      margin: 1 3;
    }
    DisclaimerModal #ok {
      align-horizontal: center;
    }"""

    def compose(self) -> ComposeResult:
        yield Container(
            Label("Software Disclaimer", id="disclaimer-title"),
            Markdown(disclaimer_text, id="disclaimer-text"),
            Center(Button("Ok", variant="primary", id="ok")),
            id="disclaimer-container",
        )

    @on(Button.Pressed, "#ok")
    def on_exit_app(self) -> None:
        self.app.pop_screen()
