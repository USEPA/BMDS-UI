import os
import tempfile
from pathlib import Path

import pytest
from textual.widgets import TabbedContent
from textual.widgets._tabbed_content import ContentTab

from bmds_ui.desktop import components
from bmds_ui.desktop.cli import get_app


@pytest.fixture
def rollback_get_app(settings):
    # The `get_app` method has a few side effects to django settings; fix tests so they don't persist
    yield
    # revert cache settings
    os.environ.pop("DJANGO_SETTINGS_MODULE", None)
    # revert cache settings
    cache_location = os.getenv("DJANGO_CACHE_LOCATION")
    cache = (
        {
            "BACKEND": "django_redis.cache.RedisCache",
            "LOCATION": cache_location,
            "OPTIONS": {"CLIENT_CLASS": "django_redis.client.DefaultClient"},
            "TIMEOUT": 60 * 10,  # 10 minutes (in seconds)
        }
        if cache_location
        else {
            "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
            "TIMEOUT": 60 * 10,  # 10 minutes (in seconds)
        }
    )
    settings.CACHES = {"default": cache}


@pytest.mark.django_db
@pytest.mark.asyncio
class TestApplication:
    async def test_cli_walkthrough(self, rollback_get_app):
        app = get_app()
        async with app.run_test(size=(125, 40)) as pilot:
            # close initial disclaimer
            assert isinstance(app.screen, components.disclaimer.DisclaimerModal)
            await pilot.press("enter")
            assert isinstance(app.screen, components.main.Main)

            # light/dark
            initial = app.dark
            await pilot.press("l")
            assert app.dark is not initial
            await pilot.press("l")
            assert app.dark is initial

            # disclaimer
            await pilot.press("d")
            assert isinstance(app.screen, components.disclaimer.DisclaimerModal)
            await pilot.press("enter")
            assert isinstance(app.screen, components.main.Main)

            # quit cancel
            await pilot.press("q")
            assert isinstance(app.screen, components.quit.QuitModal)
            await pilot.press("tab", "enter")
            assert isinstance(app.screen, components.main.Main)

            # quit
            await pilot.press("q")
            assert isinstance(app.screen, components.quit.QuitModal)
            await pilot.press("enter")
            assert app.is_running is False

    @pytest.mark.vcr
    async def test_update_check(self, rollback_get_app):
        app = get_app()
        async with app.run_test(size=(125, 40)) as pilot:
            # close initial disclaimer
            assert isinstance(app.screen, components.disclaimer.DisclaimerModal)
            app.pop_screen()
            assert app.screen.name == "main"

            # open update check modal
            await pilot.click("#update-modal")
            await pilot.pause()
            assert isinstance(app.screen, components.update_check.CheckForUpdatesModal)

            # make sure we can check updates
            await pilot.click("#btn-update-download")
            await pilot.pause()

            # make sure we can close modal
            await pilot.click("#btn-update-cancel")
            await pilot.pause()
            assert app.screen.name == "main"

    async def test_tabs(self, rollback_get_app):
        app = get_app()
        async with app.run_test(size=(125, 40)) as pilot:
            # close initial disclaimer
            assert isinstance(app.screen, components.disclaimer.DisclaimerModal)
            app.pop_screen()
            assert app.screen.name == "main"

            tabbed_content = app.query_one(TabbedContent)
            assert tabbed_content.active == "project"
            assert tabbed_content.active_pane.id == "project"

            await pilot.click(f"Tab#{ContentTab.add_prefix('log')}")
            assert tabbed_content.active == "log"
            assert tabbed_content.active_pane.id == "log"

            await pilot.click(f"Tab#{ContentTab.add_prefix('settings')}")
            assert tabbed_content.active == "settings"
            assert tabbed_content.active_pane.id == "settings"

    async def test_db_form(self, rollback_get_app):
        app = get_app()
        async with app.run_test(size=(125, 40)) as pilot:
            # close initial disclaimer
            assert isinstance(app.screen, components.disclaimer.DisclaimerModal)
            app.pop_screen()
            assert app.screen.name == "main"

            db_items = len(list(app.query(".db-edit")))

            # open db modal creation
            await pilot.click("#create-db")
            await pilot.pause()

            # cancel db modal creation
            assert isinstance(app.screen, components.database_form.DatabaseFormModel)
            await pilot.click("#db-edit-cancel")
            await pilot.pause()
            assert app.screen.name == "main"

            # open db modal creation again
            await pilot.click("#create-db")
            await pilot.pause()

            # fill out form w/ valid data
            app.query_one("#name").value = "test name"
            app.query_one("#filename").value = "test-db.sqlite"
            app.query_one("#description").value = "test description"

            with tempfile.TemporaryDirectory() as temp_dir:
                resolved_temp_dir = str(Path(temp_dir).resolve())

                # create a new db
                app.query_one("#path").value = resolved_temp_dir
                await pilot.click("#db-create")
                # wait for db creation to finish or max of 60 seconds
                max = 1
                while max < 60 and isinstance(
                    app.screen, components.database_form.DatabaseFormModel
                ):
                    await pilot.pause(delay=1)
                    max += 1
                assert app.screen.name == "main"

                # make sure a new one appears on the list page
                newly_created = list(app.query(".db-edit"))
                assert len(newly_created) == db_items + 1

                # start the application!
                start_db = list(app.query(".db-start"))
                start_db[0].focus()
                await pilot.press("enter")
                await pilot.pause()

                # stop the application!
                stop_db = list(app.query(".db-stop"))
                stop_db[0].focus()
                await pilot.press("enter")

                # edit the newly created db
                newly_created[0].focus()
                await pilot.press("enter")
                assert isinstance(app.screen, components.database_form.DatabaseFormModel)

                assert app.query_one("#name").value == "test name"
                assert app.query_one("#filename").value == "test-db.sqlite"
                assert app.query_one("#path").value == resolved_temp_dir
                assert app.query_one("#description").value == "test description"

                # update it and save (no changes)
                await pilot.click("#db-update")
                await pilot.pause()

                # edit the newly created db
                newly_created[0].focus()
                await pilot.press("enter")
                assert isinstance(app.screen, components.database_form.DatabaseFormModel)

                # delete it
                await pilot.click("#db-delete")
                await pilot.pause()

                assert len(list(app.query(".db-edit"))) == db_items
