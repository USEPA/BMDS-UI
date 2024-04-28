from django.contrib.auth import get_user_model
from django.contrib.sessions.middleware import SessionMiddleware
from django.test import RequestFactory, TestCase
from django.urls import reverse

from bmds_server.common.views import ExternalAuth


class MockExternalAuth(ExternalAuth):
    # mock user metdata handler for test case
    def get_user_metadata(self, request):
        return {
            "email": request.headers["Email"],
            "username": request.headers["Username"],
            "first_name": request.headers["Firstname"],
            "last_name": request.headers["Lastname"],
        }


class ExternalAuthTests(TestCase):
    request_factory = RequestFactory()
    middleware = SessionMiddleware(lambda response: response)

    def _login(self, email, username):
        headers = {
            "HTTP_EMAIL": email,
            "HTTP_USERNAME": username,
            "HTTP_FIRSTNAME": "John",
            "HTTP_LASTNAME": "Doe",
        }
        request = self.request_factory.get("/", **headers)
        self.middleware.process_request(request)
        return MockExternalAuth.as_view()(request)

    def test_valid_auth(self):
        User = get_user_model()
        email = "admin@bmdsonline.org"
        username = "admin@bmdsonline.org"
        # If email is associated with user then user is logged in
        response = self._login(email, username)
        assert response.status_code == 302
        user = User.objects.get(username=username)
        assert user.is_authenticated

    def test_create_user(self):
        User = get_user_model()
        email = "new_user@example.com"
        username = "new_user"
        # If user doesn't exist, it should be created and logged in
        response = self._login(email, username)
        assert response.status_code == 302
        user = User.objects.get(username=username)
        assert user.is_authenticated and user.username == username
        assert user.first_name == "John" and user.last_name == "Doe"

    def test_invalid_auth(self):
        # Fails if headers are invalid / missing
        forbidden_url = reverse("401")
        request = self.request_factory.get("/")
        response = ExternalAuth.as_view()(request)
        assert response.status_code == 302 and response.url == forbidden_url

        # Fails if email/username doesn't match
        email = "new_user@example.com"
        username = "nu"
        self._login(email, username)  # Creates the user
        bad_username = "wrong_id"
        response = self._login(email, bad_username)
        assert response.status_code == 302 and response.url == forbidden_url

        # Fails if email doesn't match username
        bad_email = "another_user@example.com"
        response = self._login(bad_email, username)
        assert response.status_code == 302 and response.url == forbidden_url
