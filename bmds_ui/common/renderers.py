import json
from io import BytesIO
from typing import NamedTuple

from rest_framework.renderers import BaseRenderer


class TxtRenderer(BaseRenderer):
    media_type = "text/plain"
    format = "txt"

    def render(self, text: str, accepted_media_type, renderer_context):
        return text


class BinaryFile(NamedTuple):
    data: BytesIO
    filename: str


class XlsxRenderer(BaseRenderer):
    media_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    format = "xlsx"

    def render(self, dataset: dict | BinaryFile, media_type=None, renderer_context=None):
        if isinstance(dataset, dict):
            return json.dumps(dataset).encode()

        response = renderer_context["response"]
        response["Content-Disposition"] = f'attachment; filename="{dataset.filename}.xlsx"'
        return dataset.data.getvalue()


class DocxRenderer(BaseRenderer):
    media_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    format = "docx"

    def render(self, dataset: dict | BinaryFile, media_type=None, renderer_context=None):
        if isinstance(dataset, dict):
            return json.dumps(dataset).encode()

        response = renderer_context["response"]
        response["Content-Disposition"] = f'attachment; filename="{dataset.filename}.docx"'
        return dataset.data.getvalue()


class ZipRenderer(BaseRenderer):
    media_type = "application/zip"
    format = "zip"

    def render(self, dataset: dict | BinaryFile, media_type=None, renderer_context=None):
        if isinstance(dataset, dict):
            return json.dumps(dataset).encode()

        response = renderer_context["response"]
        response["Content-Disposition"] = f'attachment; filename="{dataset.filename}.zip"'
        return dataset.data.getvalue()
