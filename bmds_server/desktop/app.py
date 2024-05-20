from typing import ClassVar

from textual.app import App, ComposeResult
from textual.containers import ScrollableContainer
from textual.widgets import Footer, TabbedContent, TabPane

from .actions import AppRunner
from .components.database_list import DatabaseList
from .components.disclaimer import DisclaimerModal
from .components.header import Header
from .components.log import AppLog
from .components.quit import QuitModal
from .components.settings import Settings


class BmdsDesktopTui(App):
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
        self.action_show_disclaimer()

    def compose(self) -> ComposeResult:
        """Create child widgets for the app."""
        yield Header()
        with ScrollableContainer():
            with TabbedContent(id="tabs", initial="project"):
                with TabPane("Projects", id="project"):
                    yield DatabaseList()
                with TabPane("Logging", id="log"):
                    yield AppLog()
                with TabPane("Settings", id="settings"):
                    yield Settings()
        yield Footer()

    def action_quit(self):
        """Exit the application."""
        self.push_screen(QuitModal(classes="modal-window"))

    def action_toggle_dark(self):
        """An action to toggle dark mode."""
        self.dark = not self.dark

    def action_show_disclaimer(self):
        """An action to show the disclaimer."""
        self.push_screen(DisclaimerModal())
