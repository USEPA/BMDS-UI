from textual import on
from textual.app import App, ComposeResult
from textual.containers import ScrollableContainer
from textual.reactive import reactive
from textual.widgets import Button, Footer, Label, TabbedContent, TabPane

from .. import __version__
from .components.database_list import DatabaseList
from .components.header import Header
from .components.log import Log
from .components.quit import QuitModal
from .components.settings import Settings
from .components.update_check import CheckForUpdatesModal


class BmdsDesktopTui(App):
    config = reactive({})

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

    @on(Button.Pressed, "#quit-modal")
    def on_quit_modal(self) -> None:
        self.push_screen(QuitModal())

    @on(Button.Pressed, "#update-modal")
    def on_update_modal(self) -> None:
        self.push_screen(CheckForUpdatesModal())
