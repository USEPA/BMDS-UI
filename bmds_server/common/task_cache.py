import abc
from enum import IntEnum
from typing import Any

from django.core.cache import cache
from pydantic import BaseModel


class ReportStatus(IntEnum):
    QUEUED = 1
    COMPLETE = 2


class ReportResponse(BaseModel):
    status: ReportStatus
    content: Any | None = None
    header: str | None = None
    message: str | None = None


# TODO - remove this stuff; it doesn't work with our current workflow
class ReportCache(abc.ABC):
    """
    A cache designed for long-running report tasks.  The cache is designed for polling requests;
    initially a QUEUED status will be created, followed by the actual result.  Results can be
    cached for a long period, or could be discarded immediately after returning to a user.
    """

    cache_prefix: str = ""  # should be unique for each subclass
    status = ReportStatus

    def __init__(self, analysis, **kw):
        self.cache = cache
        self.analysis = analysis
        self.kw = kw

    @property
    def cache_key(self):
        return f"{self.cache_prefix}-{self.analysis.id}"

    def delete(self):
        self.cache.delete(self.cache_key)

    @abc.abstractmethod
    def invoke_celery_task(self) -> None:
        """
        Invoke celery task to invoke which does the work in the create method.

        Returns None.
        """
        ...

    @abc.abstractmethod
    def create(self) -> Any:
        """
        The expensive method which does all the work.

        Returns:
            Any: The content to be returned, and cached
        """
        ...

    def request_content(self) -> ReportResponse:
        """
        Request the content if it exists; otherwise return teh current status and optionally kick
        off a task to create it. To be called from an HTTP request lifecycle.

        Returns:
            ReportResponse:
        """

        # try to get content from cache
        key = self.cache_key
        response = self.cache.get(key)
        if response:
            return response

        # nothing done yet, request!
        response = ReportResponse(
            status=ReportStatus.QUEUED,
            content=None,
            header="Report being created",
            message="Report requested... please wait until results are complete.",
        )
        self.cache.set(key, response, 60 * 10)  # save a queued status for up to 10 minutes
        self.invoke_celery_task()
        return response

    def create_content(self) -> ReportResponse:
        """
        Generate and cache the content.
        """
        key = self.cache_key
        content = self.create()
        response = ReportResponse(
            status=ReportStatus.COMPLETE,
            content=content,
            header=None,
            message=None,
        )
        self.cache.set(key, response, timeout=60 * 60)  # save result for up 1 hour
        return response
