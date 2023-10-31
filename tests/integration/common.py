import os

import pytest
from django.contrib.staticfiles.testing import StaticLiveServerTestCase
from django.test import TestCase
from playwright.sync_api import Page

CAN_EXECUTE = os.getenv("CI") is None
RUN_INTEGRATION = os.environ.get("INTEGRATION_TESTS") is not None
if RUN_INTEGRATION:
    os.environ["DJANGO_ALLOW_ASYNC_UNSAFE"] = "true"


@pytest.mark.skipif(not RUN_INTEGRATION, reason=f"RUN_INTEGRATION is {RUN_INTEGRATION}")
class PlaywrightTestCase(StaticLiveServerTestCase, TestCase):
    """
    We use a single class that inherits from both StaticLiveServerTestCase and TestCase
    in order to supersede properties of StaticLiveServerTestCase that cause the database to be
    flushed after every test, while still being able to utilize a live server for HTTP requests.
    Further reading: https://code.djangoproject.com/ticket/23640#comment:3
    """

    host = os.environ.get("LIVESERVER_HOST", "localhost")
    port = int(os.environ.get("LIVESERVER_PORT", 0))

    @pytest.fixture(autouse=True)
    def set_fixtures(self, page: Page):
        self.can_execute: bool = CAN_EXECUTE
        self.page: Page = page

    def url(self, path: str) -> str:
        """
        The live server URL path

        Args:
            path (str, optional): the URL to go to
        """
        return f"{self.live_server_url}{path}"
