from textual.widgets import Button, Markdown, Static

from .. import content


class Header(Static):
    def compose(self):
        yield Markdown(content.get_title_md())
        yield Markdown(content.get_desc_md())
        yield Button(label="Quit Application", variant="error", id="quit-modal")
        yield Button(label="Check for Updates", variant="default", id="update-modal")
