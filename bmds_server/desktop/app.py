from textual.app import App, ComposeResult
from textual.containers import ScrollableContainer
from textual.widgets import Footer, TabbedContent, TabPane

from .components.database_list import DatabaseList
from .components.header import Header
from .components.log import Log
from .components.settings import Settings


class BmdsDesktopTui(App):
    def compose(self) -> ComposeResult:
        """Create child widgets for the app."""
        yield Header()
        with ScrollableContainer():
            with TabbedContent(id="tabs", initial="project"):
                with TabPane("Projects", id="project"):
                    yield DatabaseList()
                with TabPane("Logging", id="log"):
                    yield Log()
                with TabPane("Settings", id="settings"):
                    yield Settings()
        yield Footer()
