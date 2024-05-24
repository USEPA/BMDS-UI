import pytest
from django.test import Client
from django.urls import reverse

from bmds_server.common import diagnostics


@pytest.fixture
@pytest.mark.django_db
def admin_client():
    client = Client()
    client.login(username="admin@bmdsonline.org", password="pw")
    return client


@pytest.mark.django_db
def test_diagnostic_500(admin_client):
    url = reverse("admin:auth_user_changelist")
    data = {"action": "diagnostic_500", "_selected_action": 1}
    with pytest.raises(diagnostics.IntentionalException):
        admin_client.post(url, data)


@pytest.mark.django_db
def test_diagnostic_cache(admin_client):
    url = reverse("admin:auth_user_changelist")
    data = {"action": "diagnostic_cache", "_selected_action": 2}
    resp = admin_client.post(url, data, follow=True)
    assert "Cache test executed successfully" in resp.content.decode()


@pytest.mark.django_db
def diagnostic_celery_task(admin_client):
    url = reverse("admin:auth_user_changelist")
    data = {"action": "diagnostic_celery_task", "_selected_action": 3}
    resp = admin_client.post(url, data, follow=True)
    assert "Celery task executed successfully" in resp.content.decode()


@pytest.mark.django_db
def diagnostic_email(admin_client):
    url = reverse("admin:auth_user_changelist")
    data = {"action": "diagnostic_email", "_selected_action": 4}
    resp = admin_client.post(url, data, follow=True)
    assert "Attempted to send email" in resp.content.decode()
