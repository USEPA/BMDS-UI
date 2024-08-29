import os
import secrets
import tempfile
from pathlib import Path

import pytest
from textual.widgets import Button, TabbedContent
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
            await assert_change_screen(pilot, app, app.query_one("#create-db"), "main", "db_form")

            # cancel db modal creation
            await assert_change_screen(
                pilot, app, app.query_one("#db-edit-cancel"), "db_form", "main"
            )

            # open db modal creation again
            await assert_change_screen(pilot, app, app.query_one("#create-db"), "main", "db_form")

            # fill out form w/ valid data
            app.query_one("#name").value = f"Test {secrets.token_urlsafe(8)}"
            app.query_one("#filename").value = "test-db.db"
            app.query_one("#description").value = "test description"

            with tempfile.TemporaryDirectory() as temp_dir:
                resolved_temp_dir = str(Path(temp_dir).resolve())

                # CREATE
                app.query_one("#path").value = resolved_temp_dir
                await assert_change_screen(
                    pilot, app, app.query_one("#db-create"), "db_form", "main"
                )

                # make sure a new one appears on the list page
                newly_created = list(app.query(".db-edit"))
                first = newly_created[0]
                assert len(newly_created) == db_items + 1

                # START/STOP APPLICATION
                await click_first_button(pilot, app, app.query(".db-start"))
                await click_first_button(pilot, app, app.query(".db-stop"))

                # CANCEL UPDATE
                await assert_change_screen(pilot, app, first, "main", "db_form")
                assert app.query_one("#name").value.startswith("Test ")
                assert app.query_one("#filename").value == "test-db.db"
                assert app.query_one("#path").value == resolved_temp_dir
                assert app.query_one("#description").value == "test description"
                await assert_change_screen(
                    pilot, app, app.query_one("#db-edit-cancel"), "db_form", "main"
                )

                # UPDATE
                await assert_change_screen(pilot, app, first, "main", "db_form")
                app.query_one("#description").value = "test description #2"
                await assert_change_screen(
                    pilot, app, app.query_one("#db-update"), "db_form", "main"
                )

                # requery; update caused screen layout and removed first attribute
                newly_created = list(app.query(".db-edit"))
                first = newly_created[0]

                # delete it
                await assert_change_screen(pilot, app, first, "main", "db_form")
                await assert_change_screen(
                    pilot, app, app.query_one("#db-delete"), "db_form", "main"
                )
                assert len(list(app.query(".db-edit"))) == db_items


async def click_first_button(pilot, app, query):
    list(query)[0].focus()
    await pilot.press("enter")
    await pilot.pause()


async def assert_change_screen(pilot, app, btn: Button, current_screen: str, new_screen: str):
    assert app.screen.name == current_screen
    btn.focus()
    await pilot.press("enter")
    await pilot.pause()
    assert app.screen.name == new_screen
