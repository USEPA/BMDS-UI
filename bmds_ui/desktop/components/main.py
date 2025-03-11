from textual.app import ComposeResult
from textual.containers import ScrollableContainer
from textual.screen import Screen
from textual.widgets import Footer, TabbedContent, TabPane

from .database_list import DatabaseList
from .disclaimer import DisclaimerModal
from .header import Header
from .log import AppLog
from .quit import QuitModal
from .settings import Settings


class Main(Screen):
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
        self.app.push_screen(QuitModal(classes="modal-window"))

    def action_show_disclaimer(self):
        """An action to show the disclaimer."""
        self.app.push_screen(DisclaimerModal())
