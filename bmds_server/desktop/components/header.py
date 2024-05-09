from textual import on
from textual.widgets import Button, Markdown, Static

from .. import content
from .quit import QuitModal
from .update_check import CheckForUpdatesModal


class Header(Static):
    def compose(self):
        yield Markdown(content.get_title_md())
        yield Markdown(content.get_desc_md())
        yield Button(label="Quit Application", variant="error", id="quit-modal")
        yield Button(label="Check for Updates", variant="default", id="update-modal")

    @on(Button.Pressed, "#quit-modal")
    def on_quit_modal(self) -> None:
        self.app.push_screen(QuitModal())

    @on(Button.Pressed, "#update-modal")
    def on_update_modal(self) -> None:
        self.app.push_screen(CheckForUpdatesModal())
