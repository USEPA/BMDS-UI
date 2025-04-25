import json
from io import BytesIO
from typing import NamedTuple, TypeAlias

import pandas as pd
from rest_framework.renderers import BaseRenderer

from pybmds.reporting.styling import Report


class TxtRenderer(BaseRenderer):
    media_type = "text/plain"
    format = "txt"

    def render(self, text: str, accepted_media_type, renderer_context):
        return text


class BinaryFile(NamedTuple):
    data: BytesIO
    filename: str


BinaryRendererData: TypeAlias = list | dict | BinaryFile


def write_error_docx(context: str = "") -> BinaryFile:
    report = Report.build_default()
    report.document.add_heading("An error occurred", 1)
    report.document.add_paragraph(context)
    file = BytesIO()
    report.document.save(file)
    return BinaryFile(data=file, filename="error")


def write_error_xlsx(context: str = "") -> BinaryFile:
    content = json.dumps(context, indent=2)
    df = pd.DataFrame({"Status": [content]})
    file = BytesIO()
    with pd.ExcelWriter(file) as writer:
        df.to_excel(writer, index=False)
    return BinaryFile(data=file, filename="error")


class XlsxRenderer(BaseRenderer):
    media_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    format = "xlsx"

    def render(self, data: BinaryRendererData, accepted_media_type=None, renderer_context=None):
        if not isinstance(data, BinaryFile):
            try:
                context = json.dumps(data, indent=2)
            except TypeError:
                context = "An error occurred"
            data = write_error_xlsx(context)

        response = renderer_context["response"]
        response["Content-Disposition"] = f'attachment; filename="{data.filename}.xlsx"'
        return data.data.getvalue()


class DocxRenderer(BaseRenderer):
    media_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    format = "docx"

    def render(self, data: BinaryRendererData, accepted_media_type=None, renderer_context=None):
        if not isinstance(data, BinaryFile):
            try:
                context = json.dumps(data, indent=2)
            except TypeError:
                context = "An error occurred"
            data = write_error_docx(context)

        response = renderer_context["response"]
        response["Content-Disposition"] = f'attachment; filename="{data.filename}.docx"'
        return data.data.getvalue()
