from io import BytesIO

from ...common.task_cache import ReportCache
from .. import tasks
from .docx import build_docx


class ExcelReportCache(ReportCache):
    cache_prefix = "excel"

    def invoke_celery_task(self):
        return tasks.generate_excel.delay(str(self.analysis.id))

    def create(self) -> BytesIO:
        return self.analysis.to_excel()


class DocxReportCache(ReportCache):
    cache_prefix = "docx"

    def invoke_celery_task(self):
        return tasks.generate_report.delay(str(self.analysis.id), **self.kw)

    def create(self) -> BytesIO:
        return build_docx(self.analysis, **self.kw)
