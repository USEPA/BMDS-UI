import logging

from django.http import HttpRequest

logger = logging.getLogger("bmds_ui.request")


def get_user_id(user) -> int:
    return 0 if user.is_anonymous else user.id


class RequestLogMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request: HttpRequest):
        response = self.get_response(request)
        message = "{} {} {} {} ip-{} user-{}".format(
            request.method,
            request.path,
            response.status_code,
            len(getattr(response, "content", "")),
            request.META["REMOTE_ADDR"],
            get_user_id(request.user),
        )
        logger.info(message)
        return response
