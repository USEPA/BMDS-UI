from textual.app import App, ComposeResult
from textual.containers import ScrollableContainer
from textual.widgets import Footer, TabbedContent, TabPane

from .actions import AppRunner
from .components.database_list import DatabaseList
from .components.header import Header
from .components.log import AppLog
from .components.settings import Settings


class BmdsDesktopTui(App):
    def __init__(self, **kw):
        self.webapp = AppRunner()
        super().__init__(**kw)

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
