from typing import ClassVar

from textual.app import App

from .actions import AppRunner
from .components.disclaimer import DisclaimerModal
from .components.main import Main
from .components.quit import QuitModal


class BmdsDesktopTui(App):
    ENABLE_COMMAND_PALETTE = False
    CSS_PATH = "components/style.tcss"

    BINDINGS: ClassVar = [
        ("q", "quit", "Exit"),
        ("d", "show_disclaimer", "Disclaimer"),
        ("l", "toggle_dark", "Light/Dark"),
    ]

    def __init__(self, **kw):
        self.webapp = AppRunner()
        super().__init__(**kw)

    def on_mount(self) -> None:
        self.push_screen(Main(name="main"))
        self.push_screen(DisclaimerModal())

    def action_quit(self):
        """Exit the application."""
        self.push_screen(QuitModal(classes="modal-window"))

    def action_toggle_dark(self):
        """An action to toggle dark mode."""
        self.dark = not self.dark

    def action_show_disclaimer(self):
        """An action to show the disclaimer."""
        self.push_screen(DisclaimerModal())
