import logging

import pytest
from django.test import Client


@pytest.mark.django_db
class TestRequestLogMiddleware:
    def test_logging(self, caplog):
        # setup
        caplog.set_level(logging.INFO)

        # get logs
        client = Client()
        client.get("/")

        # make sure we have a record and it matches expected pattern
        matches = [rec for rec in caplog.records if rec.name == "bmds_ui.request"]
        assert len(matches) > 0
        message = matches[0].message
        assert "GET / 200" in message
        assert "user-0" in message
