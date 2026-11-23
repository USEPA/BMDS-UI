import abc
import hashlib
import json
import logging
from enum import IntEnum
from typing import Any

from django.core.cache import cache
from pydantic import BaseModel

logger = logging.getLogger(__name__)


class ReportStatus(IntEnum):
    QUEUED = 1
    COMPLETE = 2
    FAILED = 3


class ReportResponse(BaseModel):
    status: ReportStatus
    content: Any | None = None
    header: str | None = None
    message: str | None = None
    analysis_fingerprint: str | None = None


class ReportCache(abc.ABC):
    """
    A cache designed for long-running report tasks.  The cache is designed for polling requests;
    initially a QUEUED status will be created, followed by the actual result.  Results can be
    cached for a long period, or could be discarded immediately after returning to a user.
    """

    cache_prefix: str = ""  # should be unique for each subclass
    status = ReportStatus

    def __init__(self, analysis, expected_fingerprint: str | None = None, **kw):
        self.cache = cache
        self.analysis = analysis
        self.expected_fingerprint = expected_fingerprint
        self.kw = kw

    @property
    def render_options(self) -> dict[str, Any]:
        return self.kw

    @property
    def options_fingerprint(self) -> str:
        normalized = json.dumps(
            self.render_options,
            sort_keys=True,
            separators=(",", ":"),
            ensure_ascii=True,
            default=str,
        )
        return hashlib.sha256(normalized.encode("ascii")).hexdigest()

    @property
    def cache_key(self):
        expected = self.expected_fingerprint or "<missing>"
        return f"{self.cache_prefix}-{self.analysis.id}-{expected}-{self.options_fingerprint}"

    def delete(self):
        pattern = f"{self.cache_prefix}-{self.analysis.id}-*"
        if hasattr(self.cache, "delete_pattern"):
            self.cache.delete_pattern(pattern)
            return

        # fallback for non-redis caches used in tests/local runs
        self.cache.delete(self.cache_key)

    def require_snapshot_fingerprint(self) -> str:
        current = self.analysis.analysis_fingerprint
        if current is None:
            raise ValueError("Save changes and successfully execute the analysis first.")
        if not self.expected_fingerprint:
            raise ValueError("An expected fingerprint is required.")
        if current != self.expected_fingerprint:
            raise ValueError("The analysis changed during export. Refresh and export again.")
        return current

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
            header="Request received",
            message="Report being created... please wait until results are complete.",
            analysis_fingerprint=self.expected_fingerprint,
        )
        self.cache.set(key, response, 60 * 10)  # save a queued status for up to 10 minutes
        self.invoke_celery_task()
        return response

    def create_content(self) -> ReportResponse:
        """
        Generate and cache the content. On failure, cache a FAILED response instead of leaving the stale QUEUED entry to expire silently.
        """
        key = self.cache_key
        snapshot_fingerprint = None
        try:
            snapshot_fingerprint = self.require_snapshot_fingerprint()
            content = self.create()
        except Exception as e:
            logger.exception("Report generation failed", extra={"cache_key": key})
            response = ReportResponse(
                status=ReportStatus.FAILED,
                content=None,
                header="Report Failed",
                message=str(e) or "An error occured while generating the report",
                analysis_fingerprint=snapshot_fingerprint or self.expected_fingerprint,
            )
            self.cache.set(key, response, timeout=60 * 10)
            raise
        response = ReportResponse(
            status=ReportStatus.COMPLETE,
            content=content,
            header=None,
            message=None,
            analysis_fingerprint=snapshot_fingerprint,
        )
        self.cache.set(key, response, timeout=60 * 60)  # save result for up 1 hour
        return response
