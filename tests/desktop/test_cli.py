import pytest
from textual.widgets import Tabs

from bmds_server.desktop.cli import BmdsDesktop


@pytest.mark.asyncio
async def test_keys():
    app = BmdsDesktop()

    async with app.run_test() as pilot:
        btn_start = app.query_one("#runner-button")
        assert btn_start.label.__str__() == "Start BMDS Desktop"
        await pilot.press("s")
        btn_start = app.query_one("#runner-button")
        assert btn_start.label.__str__() == "Stop BMDS Desktop"


@pytest.mark.asyncio
async def test_tab_navigation_keyboard():
    """Keyboard Navigation"""
    app = BmdsDesktop()

    async with app.run_test() as pilot:
        tabs = pilot.app.query_one(Tabs)
        # That there are 3 tabs
        assert tabs.tab_count == 3
        # That when open app, a tab is active, and is "app" tab
        assert tabs.active_tab is not None
        assert tabs.active_tab.id == "app"
        assert tabs.active == tabs.active_tab.id
        # set focus to window
        await pilot.press("tab")
        # Check app tab content
        btn_start = app.query_one("#runner-button")
        assert btn_start.label.__str__() == "Start BMDS Desktop"
        # Go to Logging tab
        await pilot.press("right")  # press right arrow key
        assert tabs.active_tab is not None
        assert tabs.active_tab.id == "tab-2"
        assert tabs.active == tabs.active_tab.id
        # Go to Config Tab
        await pilot.press("right")  # press right arrow key
        assert tabs.active_tab is not None
        assert tabs.active_tab.id == "config"
        assert tabs.active == tabs.active_tab.id
        # check Config tab buttons
        btn_fn = app.query_one("#btn-fn-container")
        assert btn_fn.label.__str__() == "Create New Project"
        btn_dir = app.query_one("#btn-dir-container")
        assert btn_dir.label.__str__() == "Directory / Project"
