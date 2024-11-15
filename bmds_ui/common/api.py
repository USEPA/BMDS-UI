from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.throttling import UserRateThrottle

from .worker_health import worker_healthcheck


class FivePerMinuteThrottle(UserRateThrottle):
    rate = "5/min"


class HealthcheckViewset(viewsets.ViewSet):
    @action(detail=False)
    def web(self, request):
        return Response({"healthy": True})

    @action(detail=False)
    def worker(self, request):
        is_healthy = worker_healthcheck.healthy()
        status_code = status.HTTP_200_OK if is_healthy else status.HTTP_503_SERVICE_UNAVAILABLE
        return Response({"healthy": is_healthy}, status=status_code)
