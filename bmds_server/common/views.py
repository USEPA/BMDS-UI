import logging
from collections.abc import Iterable
from functools import wraps
from pprint import pformat
from textwrap import dedent
from typing import Any
from uuid import UUID

from django.conf import settings
from django.contrib.admin.views.decorators import staff_member_required
from django.contrib.auth import get_user_model, login
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth.views import LoginView, LogoutView
from django.core.mail import mail_admins
from django.http import (
    Http404,
    HttpRequest,
    HttpResponseBadRequest,
    HttpResponseNotAllowed,
    HttpResponseRedirect,
)
from django.shortcuts import resolve_url
from django.template.response import TemplateResponse
from django.urls import reverse
from django.utils.decorators import method_decorator
from django.views.generic import TemplateView, View

from ..main.constants import AuthProvider

logger = logging.getLogger(__name__)


class Error401Response(TemplateResponse):
    status_code = 401  # Unauthorized


class Error401(TemplateView):
    response_class = Error401Response
    template_name = "401.html"


class AppLoginView(LoginView):
    def dispatch(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            return HttpResponseRedirect(resolve_url(settings.LOGIN_REDIRECT_URL))
        if settings.AUTH_PROVIDERS == {AuthProvider.external}:
            url = reverse("external_auth")
            return HttpResponseRedirect(url)
        return super().dispatch(request, *args, **kwargs)


class AppLogoutView(LogoutView):
    pass


class AdminLoginView(LoginView):
    form_class = AuthenticationForm
    template_name = "admin/login.html"

    def dispatch(self, request, *args, **kwargs):
        if settings.AUTH_PROVIDERS == {AuthProvider.external}:
            return HttpResponseRedirect(reverse("external_auth"))
        return super().dispatch(request, *args, **kwargs)

    def get_context_data(self, **kwargs: Any) -> dict[str, Any]:
        context = super().get_context_data(**kwargs)
        context["auth_providers"] = settings.AUTH_PROVIDERS
        return context

    def get_success_url(self):
        url = self.get_redirect_url()
        return url or reverse("admin:index")


class ExternalAuth(View):
    def get_user_metadata(self, request) -> dict:
        """
        Retrieve user metadata from request to use for authentication.

        Expected that this request is made from a protected upstream proxy which controls values
        in the incoming request after successful upstream authentication.

        Args:
            request: incoming request

        Returns:
            dict: user metadata; must include "email" and "username" keys
        """
        raise NotImplementedError("Deployment specific; requires implementation")

    def mail_bad_headers(self, request):
        """Mail admins when headers don't return valid user metadata"""
        subject = "[External auth]: Bad headers"
        data = pformat(request.headers._store)
        body = f"External authentication failed with the following headers:\n{data}"
        mail_admins(subject, body)

    def mail_bad_auth(self, email, username):
        """Mail admins when the email / username pair clashes with user in database"""
        subject = "[External auth]: Invalid credentials"
        body = dedent(
            f"""\
            Credentials given in request only partially apply to a user. Credentials are as follows:
            Email: {email}
            Username: {username}
            """
        )
        mail_admins(subject, body)

    def get(self, request, *args, **kwargs):
        # Get user metadata from request
        try:
            metadata = self.get_user_metadata(request)
        except Exception:
            self.mail_bad_headers(request)
            logger.warning("Cannot fetch auth data; bad headers")
            return HttpResponseRedirect(reverse("401"))
        email = metadata.pop("email")
        username = metadata.pop("username")
        User = get_user_model()
        try:
            user = User.objects.get(username=username)
            # Ensure email in db matches that returned from service
            if user.email != email:
                logger.warning(f"User already exists {username} / {email}")
                self.mail_bad_auth(email, username)
                return HttpResponseRedirect(reverse("401"))
        except User.DoesNotExist:
            # Ensure email is unique
            if User.objects.filter(email=email).exists():
                logger.warning(f"User already exists {username} / {email}")
                self.mail_bad_auth(email, username)
                return HttpResponseRedirect(reverse("401"))
            # Create user
            user = User.objects.create_user(email=email, username=username, **metadata)
            logger.info(f"Creating user {user.id}: {email}")
        logger.info(f"Successfully logging in user {user}")
        login(request, user)
        return HttpResponseRedirect(resolve_url(settings.LOGIN_REDIRECT_URL))


@method_decorator(staff_member_required, name="dispatch")
class Swagger(TemplateView):
    template_name = "common/swagger.html"


def is_htmx(request: HttpRequest) -> bool:
    """Was this request initiated by HTMX?"""
    return request.headers.get("HX-Request", "") == "true"


def action(htmx_only: bool = True, methods: Iterable[str] = ("get",)):
    """Decorator for an HtmxViewSet action method

    Influenced by django-rest framework's ViewSet action decorator; permissions checking that
    the user making the request can make this request, and the request is valid.

    Args:
        htmx_only (bool, optional, default True): Accept only htmx requests
        methods (Iterable[str]): Accepted http methods; defaults to ("get",)
    """

    def actual_decorator(func):
        @wraps(func)
        def wrapper(view, request, *args, **kwargs):
            # check if htmx is required
            if htmx_only and not is_htmx(request):
                return HttpResponseBadRequest("An HTMX request is required")
            # check valid view method
            if request.method.lower() not in methods:
                return HttpResponseNotAllowed("Invalid HTTP method")
            return func(view, request, *args, **kwargs)

        return wrapper

    return actual_decorator


def desktop_only(func):
    """Require request to be in desktop mode-ony."""

    @wraps(func)
    def wrapper(request, *args, **kwargs):
        if not settings.IS_DESKTOP:
            raise Http404()
        return func(request, *args, **kwargs)

    return wrapper


class HtmxView(View):
    """Build a generic HtmxView which returns a index full page and multiple fragments.

    If a valid "action" is specified via a GET parameter, a partial is returned, otherwise
    the default_action ("index") is returned. It is generally assumed that the default_action
    is a full page, while all other pages are fragments.
    """

    actions: set[str]
    default_action: str = "index"

    def get_handler(self, request: HttpRequest):
        request.action = self.kwargs.get("action", "")
        if request.action not in self.actions:
            request.action = self.default_action
        return getattr(self, request.action, self.http_method_not_allowed)

    def dispatch(self, request, *args, **kwargs):
        handler = self.get_handler(request)
        return handler(request, *args, **kwargs)


def is_uuid_or_404(value: str) -> UUID:
    try:
        return UUID(value)
    except ValueError:
        raise Http404()
