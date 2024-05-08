from textual import on
from textual.app import App, ComposeResult
from textual.containers import ScrollableContainer
from textual.widgets import Button, Footer, Label, TabbedContent, TabPane

from .. import __version__
from .components.header import Header
from .components.quit import QuitModal
from .components.update_check import CheckForUpdatesModal


class BmdsDesktopTui(App):
    def compose(self) -> ComposeResult:
        yield Label("settings")

    def compose_complete(self) -> ComposeResult:
        """Create child widgets for the app."""
        with ScrollableContainer():
            yield Header()
            with TabbedContent(id="tabs", initial="project"):
                with TabPane("Projects", id="project"):
                    yield Label("projects")
                with TabPane("Logging", id="log"):
                    yield Label("logging")
                with TabPane("Settings", id="settings"):
                    yield Label("settings")
        yield Footer()

    def on_mount(self) -> None:
        self.title = "BMDS Desktop"
        self.sub_title = f"Version {__version__}"

    @on(Button.Pressed, "#quit-modal")
    def on_quit_modal(self) -> None:
        self.push_screen(QuitModal())

    @on(Button.Pressed, "#update-modal")
    def on_update_modal(self) -> None:
        self.push_screen(CheckForUpdatesModal())
