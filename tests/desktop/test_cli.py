import pytest

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
