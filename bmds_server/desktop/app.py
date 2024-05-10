from textual import events
from textual.app import App, ComposeResult
from textual.containers import ScrollableContainer
from textual.widgets import Footer, TabbedContent, TabPane

from .actions import AppRunner
from .components.database_list import DatabaseList
from .components.header import Header
from .components.log import AppLog
from .components.quit import QuitModal
from .components.settings import Settings


class BmdsDesktopTui(App):
    CSS_PATH = "components/style.tcss"

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

    def on_key(self, event: events.Key) -> None:
        if event.name == "escape":
            self.app.push_screen(QuitModal())
