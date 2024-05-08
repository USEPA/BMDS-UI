from textual import on
from textual.app import ComposeResult
from textual.containers import (
    Grid,
)
from textual.reactive import reactive
from textual.screen import ModalScreen
from textual.widget import Widget
from textual.widgets import Button, Markdown

from .. import content


class UpdateTextWidget(Widget):
    text = reactive("", recompose=True)

    def compose(self) -> ComposeResult:
        yield Markdown(self.text)


class CheckForUpdatesModal(ModalScreen):
    def compose(self) -> ComposeResult:
        yield Grid(
            Markdown("This will check the internet to see if a new version is available"),
            UpdateTextWidget(),
            Button("Get Updates", variant="primary", id="btn-update-download"),
            Button("Cancel", variant="default", id="btn-update-cancel"),
        )

    def on_mount(self) -> None:
        self.query_one(UpdateTextWidget).text = content.check_version_md(check=False)

    @on(Button.Pressed, "#btn-update-download")
    def on_update_download(self):
        self.query_one(UpdateTextWidget).text = content.check_version_md(check=True)

    @on(Button.Pressed, "#btn-update-cancel")
    def on_cancel(self):
        self.app.pop_screen()
