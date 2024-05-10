from textual import on
from textual.containers import Horizontal, Vertical
from textual.widgets import Button, Label, Markdown, Static

from .. import content
from .quit import QuitModal
from .update_check import CheckForUpdatesModal


class Header(Static):
    DEFAULT_CSS = """
    Header {
      dock: top;
      height: 10;
    }
    Header .title {
      content-align: center middle;
      background: $primary;
      border: double $primary-lighten-2;
      color: white;
      height: 3;
      width: 100%;
      margin-bottom: 1;
    }
    Header .col1 {
      width: 75fr;
    }
    Header .col2 {
      width: 25fr;
      padding: 0 2 0 0;
    }
    Header .col2 Button {
      width: 100%
    }
    """

    def compose(self):
        yield Label(content.title(), classes="title")
        with Horizontal():
            with Vertical(classes="col1"):
                yield Markdown(content.description())
            with Vertical(classes="col2"):
                yield Button(label="Exit", variant="error", id="quit-modal")
                yield Button(label="Check for Updates", variant="default", id="update-modal")

    @on(Button.Pressed, "#quit-modal")
    def on_quit_modal(self) -> None:
        self.app.push_screen(QuitModal())

    @on(Button.Pressed, "#update-modal")
    def on_update_modal(self) -> None:
        self.app.push_screen(CheckForUpdatesModal())
