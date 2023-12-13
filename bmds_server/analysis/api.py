from bmds.datasets.transforms.polyk import PolyKAdjustment
from django.conf import settings
from django.core.exceptions import ValidationError
from rest_framework import exceptions, mixins, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from ..common import renderers
from ..common.renderers import BinaryFile
from ..common.serializers import UnusedSerializer
from ..common.task_cache import ReportStatus
from ..common.utils import get_bool
from ..common.validation import pydantic_validate
from . import models, schema, serializers, validators
from .reporting.cache import DocxReportCache, ExcelReportCache
from .reporting.docx import add_update_url, build_polyk_docx


class AnalysisViewset(mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    serializer_class = serializers.AnalysisSerializer
    queryset = models.Analysis.objects.prefetch_related("collections").all()

    @action(detail=False, url_path="default")
    def default(self, request, *args, **kwargs):
        data = models.Analysis().default_input()
        return Response(data)

    @action(
        detail=True,
        methods=("patch",),
        url_path="patch-inputs",
    )
    def patch_inputs(self, request, *args, **kwargs):
        """
        Validate input and if successful, patch inputs on server side.
        """
        instance = self.get_object()
        data = request.data.get("data")
        edit_key = request.data.get("editKey", "")
        partial = bool(request.data.get("partial", False))

        # permission check
        if edit_key != instance.password:
            raise exceptions.PermissionDenied()

        if not isinstance(data, dict):
            raise exceptions.ValidationError("A `data` object is required")

        try:
            validators.validate_input(data, partial=partial)
        except ValidationError as err:
            raise exceptions.ValidationError(err.message)

        instance.reset_execution()
        instance.inputs = data
        instance.save()

        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @action(detail=True, methods=("post",))
    def execute(self, request, *args, **kwargs):
        """
        Attempt to execute the model.
        """
        instance = self.get_object()

        # permissions check
        if instance.password != request.data.get("editKey", ""):
            raise exceptions.PermissionDenied()

        # preflight execution check
        if not instance.inputs_valid():
            return Response("Invalid inputs", status=400)
        elif instance.is_executing:
            return Response("Execution already started", status=400)

        # start analysis execution
        instance.reset_execution()
        instance.start_execute()

        instance.refresh_from_db()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @action(detail=True, methods=("post",), url_path="select-model")
    def select_model(self, request, *args, **kwargs):
        instance = self.get_object()

        # permissions check
        if instance.password != request.data.get("editKey", ""):
            raise exceptions.PermissionDenied()

        # validate data
        data = request.data.get("data")
        if not isinstance(data, dict):
            raise exceptions.ValidationError("A `data` object is required")

        selection = pydantic_validate(data, validators.AnalysisSelectedSchema)
        instance.update_selection(selection)

        # fetch from db and get the latest
        instance.refresh_from_db()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @action(detail=True, methods=("post",), url_path="execute-reset")
    def execute_reset(self, request, *args, **kwargs):
        """
        Attempt to execute the model.
        """
        instance = self.get_object()

        # permissions check
        if instance.password != request.data.get("editKey", ""):
            raise exceptions.PermissionDenied()

        # reset instance
        instance.reset_execution()
        instance.save()

        # fetch from db and get the latest
        instance.refresh_from_db()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @action(detail=True, renderer_classes=(renderers.XlsxRenderer,))
    def excel(self, request, *args, **kwargs):
        """
        Return Excel export of outputs for selected analysis
        """
        instance = self.get_object()
        cache = ExcelReportCache(analysis=instance)
        response = cache.request_content()
        if response.status is ReportStatus.COMPLETE:
            cache.delete()  # destroy from cache; request is now complete
            data = renderers.BinaryFile(data=response.content, filename=instance.slug)
            return Response(data)

        return Response(response.model_dump(), content_type="application/json")

    @action(detail=True, renderer_classes=(renderers.DocxRenderer,))
    def word(self, request, *args, **kwargs):
        """
        Return Word report for the selected analysis
        """
        instance: models.Analysis = self.get_object()
        uri = request.build_absolute_uri("/")[:-1]
        kwargs = {
            "dataset_format_long": get_bool(request.query_params.get("datasetFormatLong")),
            "all_models": get_bool(request.query_params.get("allModels")),
            "bmd_cdf_table": get_bool(request.query_params.get("bmdCdfTable")),
        }
        cache = DocxReportCache(analysis=instance, uri=uri, **kwargs)
        response = cache.request_content()
        if response.status is ReportStatus.COMPLETE:
            cache.delete()  # destroy from cache; request is now complete
            edit = instance.password == request.query_params.get("editKey", "")
            data = add_update_url(instance, response.content, uri) if edit else response.content
            return Response(renderers.BinaryFile(data=data, filename=instance.slug))

        return Response(response.model_dump(), content_type="application/json")

    @action(detail=True, methods=("post",))
    def star(self, request, *args, **kwargs):
        instance = self.get_object()

        # permissions check
        if instance.password != request.data.get("editKey", ""):
            raise exceptions.PermissionDenied()

        # flip the star (but don't change last_updated)
        if settings.IS_DESKTOP:
            models.Analysis.objects.filter(id=instance.id).update(starred=not instance.starred)
            instance.refresh_from_db()

        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @action(detail=True, methods=("post",))
    def collections(self, request, *args, **kwargs):
        instance = self.get_object()

        # permissions check
        if instance.password != request.data.get("editKey", ""):
            raise exceptions.PermissionDenied()

        # update collections
        if settings.IS_DESKTOP:
            ids = [d for d in request.data.get("collections", []) if isinstance(d, int)]
            collections = models.Collection.objects.filter(id__in=ids)
            instance.collections.set(collections)

        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class PolyKViewset(viewsets.GenericViewSet):
    queryset = models.Analysis.objects.none()
    serializer_class = UnusedSerializer

    def _run_analysis(self, request) -> PolyKAdjustment:
        try:
            settings = pydantic_validate(request.data, schema.PolyKInput)
        except ValidationError as err:
            raise exceptions.ValidationError(err.message)
        return settings.calculate()

    def create(self, request, *args, **kwargs):
        analysis = self._run_analysis(request)
        return Response(
            {
                "df": analysis.adjusted_data.to_dict(orient="list"),
                "df2": analysis.summary.to_dict(orient="list"),
            }
        )

    @action(detail=False, methods=["POST"], renderer_classes=(renderers.XlsxRenderer,))
    def excel(self, request, *args, **kwargs):
        analysis = self._run_analysis(request)
        data = BinaryFile(analysis.to_excel(), "polyk-adjustment")
        return Response(data)

    @action(detail=False, methods=["POST"], renderer_classes=(renderers.DocxRenderer,))
    def word(self, request, *args, **kwargs):
        analysis = self._run_analysis(request)
        f = build_polyk_docx(analysis)
        data = BinaryFile(f, "polyk-adjustment")
        return Response(data)
