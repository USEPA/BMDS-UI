from django.conf import settings
from django.core.exceptions import ValidationError
from rest_framework import exceptions, mixins, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.schemas.openapi import AutoSchema

from pybmds.datasets.transforms.polyk import PolyKAdjustment
from pybmds.datasets.transforms.rao_scott import RaoScott
from pybmds.plotting.LOUD import model_average_to_inferencedata
from pandas import DataFrame, ExcelWriter
from io import BytesIO
import tempfile
import os

from ..common import renderers
from ..common.renderers import BinaryFile
from ..common.serializers import UnusedSerializer
from ..common.task_cache import ReportStatus
from ..common.utils import get_bool, to_csv
from ..common.validation import pydantic_validate
from . import models, schema, serializers, validators
from .reporting.cache import DocxReportCache, ExcelReportCache
from .reporting.docx import add_update_url, build_polyk_docx, build_raoscott_docx, build_jonckheereterpstra_docx

import json, time, logging
logger = logging.getLogger("bmds_ui")


class AnalysisViewset(mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    serializer_class = serializers.AnalysisSerializer
    queryset = models.Analysis.objects.prefetch_related("collections").all()
    schema = AutoSchema(operation_id_base="Analysis")

    @action(detail=False, url_path="default")
    def default(self, request, *args, **kwargs):
        data = models.Analysis().default_input()
        return Response(data)

    @action(detail=False, methods=("post",))
    def migrate(self, request, *args, **kwargs):
        data = request.data.get("data")
        if not isinstance(data, dict):
            raise exceptions.ValidationError("Invalid data for migration")
        try:
            update = schema.AnalysisMigrator.migrate(data)
        except schema.SchemaMigrationException:
            raise exceptions.ValidationError("Invalid data for migration") from None
        return Response(update.model_dump())

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
            raise exceptions.ValidationError(err.message) from None

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

        t0 = time.time()
        instance.refresh_from_db()
        logger.info(f"refresh_from_db took {time.time() - t0:.1f}s")

        serializer = self.get_serializer(instance)

        t1 = time.time()
        full_size = len(json.dumps(serializer.data))
        logger.info(f"serializer.data size: {full_size} bytes, took {time.time() - t1:.1f}s to json.dumps")

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
        instance = self.get_object()
        cache = ExcelReportCache(analysis=instance)
        response = cache.request_content()

        if response.status == ReportStatus.COMPLETE:
            cache.delete()

            # Fetch persisted results
            cochran_armitage_result = (instance.outputs or {}).get("cochran_armitage_result")

            if cochran_armitage_result:
                binary_stream = response.content  # should be a BytesIO-like object
                binary_stream.seek(0)
                with ExcelWriter(binary_stream, engine="openpyxl", mode="a") as writer:
                    df = (
                        DataFrame(cochran_armitage_result)
                        .set_index("name")
                        .T
                        .rename_axis("Cochran-Armitage")
                        .reset_index()
                    )
                    df.to_excel(writer, index=False, sheet_name="Cochran Armitage")

                data = renderers.BinaryFile(data=binary_stream, filename=instance.slug)
                return Response(data)

            # return the base report
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
        extra_kwargs = {
            "dataset_format_long": get_bool(request.query_params.get("datasetFormatLong")),
            "all_models": get_bool(request.query_params.get("allModels")),
            "bmd_cdf_table": get_bool(request.query_params.get("bmdCdfTable")),
            "additionalNestedDichotomousPlots": get_bool(request.query_params.get("additionalNestedDichotomousPlots")),
        }

        # Compute result 
        cochran_armitage_result = (instance.outputs or {}).get("cochran_armitage_result")

        if cochran_armitage_result:
            df = (
                DataFrame(cochran_armitage_result)
                .set_index("name")
                .T
                .rename_axis("Cochran-Armitage")
                .reset_index()
            )
            # Pass a JSON-serializable payload
            extra_kwargs["cochran_armitage_df"] = df.to_dict(orient="records")

        cache = DocxReportCache(analysis=instance, uri=uri, **extra_kwargs)
        response = cache.request_content()
        if response.status is ReportStatus.COMPLETE:
            cache.delete()  # destroy from cache; request is now complete
            edit = instance.password == request.query_params.get("editKey", "")
            data = (
                add_update_url(instance, response.content, uri)
                if edit and not settings.IS_DESKTOP
                else response.content
            )
            return Response(renderers.BinaryFile(data=data, filename=instance.slug))

        return Response(response.model_dump(), content_type="application/json")
    
    @action(detail=True, methods=["get"], url_path="loud-inference-data", url_name = "loud-inference-data", renderer_classes=(renderers.NetCDFRenderer,))
    def loud_inference_data(self, request, *args, **kwargs):
        instance = self.get_object()
        dataset_index = request.query_params.get("dataset_index")
        option_index = request.query_params.get("option_index")

        if dataset_index is None or option_index is None:
            raise exceptions.ValidationError("dataset_index and option_index are required")
        
        try:
            dataset_index = int(dataset_index)
            option_index = int(option_index)
        except ValueError:
            raise exceptions.ValidationError("dataset_index and option_index must be integers")

        # Find the matching output
        outputs = instance.outputs.get("outputs", [])
        output_index = next(
            (i for i, o in enumerate(outputs)
             if o["dataset_index"] == dataset_index and o["option_index"] == option_index),
             None,
        )    
        if output_index is None:
            raise exceptions.NotFound("No output found for given dataset_index and option_index")


        cache = ExcelReportCache(analysis=instance)
        response = cache.request_content()

        session = instance.get_session(output_index)
        if not session.loud_bayesian:
            raise exceptions.NotFound("No LOUD Bayesian session found for this output")
        
        with tempfile.NamedTemporaryFile(suffix=".nc", delete=False) as tmp:
            tmp_path = tmp.name

        try:
            model_average_to_inferencedata(session.loud_bayesian, path=tmp_path)
            with open(tmp_path, "rb") as f:
                data_bytes=BytesIO(f.read())
        finally:
            os.unlink(tmp_path)            

        data=renderers.BinaryFile(data=data_bytes, filename=instance.slug)
        return Response(data)

    @action(detail=True, methods=["get"], url_path="output")
    def output(self, request, *args, **kwargs):
        instance = self.get_object()
        dataset_index = request.query_params.get("dataset_index")
        option_index = request.query_params.get("option_index")

        if dataset_index is None or option_index is None:
            raise exceptions.ValidationError("dataset_index and option_index are required")
        
        try: 
            dataset_index = int(dataset_index)
            option_index = int(option_index)
        except ValueError:
            raise exceptions.ValidationError("dataset_index and option_index must be integers")    
        
        outputs = instance.outputs.get("outputs", [])
        match = next(
            (o for o in outputs
             if o["dataset_index"] == dataset_index and o["option_index"] == option_index), 
             None,
        )
        if match is None:
            raise exceptions.NotFound("No output found for given dataser_index and option_index")
        
        return Response(match)


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
    schema = AutoSchema(operation_id_base="PolyK")

    def _run_analysis(self, request) -> PolyKAdjustment:
        try:
            settings = pydantic_validate(request.data, schema.PolyKInput)
        except ValidationError as err:
            raise exceptions.ValidationError(err.message) from None
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


class RaoScottViewset(viewsets.GenericViewSet):
    queryset = models.Analysis.objects.none()
    serializer_class = UnusedSerializer
    schema = AutoSchema(operation_id_base="RaoScott")

    def _run_analysis(self, request) -> RaoScott:
        try:
            settings = pydantic_validate(request.data, schema.RaoScottInput)
        except ValidationError as err:
            raise exceptions.ValidationError(err.message) from None
        analysis = settings.calculate()
        return analysis

    def create(self, request, *args, **kwargs):
        analysis = self._run_analysis(request)
        return Response({"df": analysis.df})

    @action(detail=False, methods=["POST"], renderer_classes=(renderers.XlsxRenderer,))
    def excel(self, request, *args, **kwargs):
        analysis = self._run_analysis(request)
        data = BinaryFile(analysis.to_excel(), "rao-scott-transformation")
        return Response(data)

    @action(detail=False, methods=["POST"], renderer_classes=(renderers.DocxRenderer,))
    def word(self, request, *args, **kwargs):
        analysis = self._run_analysis(request)
        f = build_raoscott_docx(analysis)
        data = BinaryFile(f, "rao-scott-transformation")
        return Response(data)


class JonckheereTerpstraViewset(viewsets.GenericViewSet):
    queryset = models.Analysis.objects.none() # not needed
    serializer_class = UnusedSerializer # not needed, pydantic is used instead
    schema = AutoSchema(operation_id_base="JonckheereTerpstra") 

    def _run_analysis(self, request):
        try:
            settings = pydantic_validate(request.data, schema.JonckheereTerpstraInput)
        except ValidationError as err:
            raise exceptions.ValidationError(err.message) from None
        analysis = settings.calculate()
        return analysis

    def create(self, request, *args, **kwargs):
        analysis, synthetic_dataset_obj = self._run_analysis(request)
        return Response({"answer": analysis, "synthetic_dataset_obj": synthetic_dataset_obj})

    @action(detail=False, methods=["POST"], renderer_classes=(renderers.XlsxRenderer,))
    def excel(self, request, *args, **kwargs):
        computed_result = request.data.get("computed_result")
        if not computed_result:
            raise exceptions.ValidationError("No Jonckheere Terpstra Trend Test result was computed")
        
        synthetic_dataset_obj = request.data.get("synthetic_dataset_obj")

        binary_stream = BytesIO()
        with ExcelWriter(binary_stream, engine="openpyxl") as writer:
            DataFrame([computed_result]).to_excel(
            writer, index=False, sheet_name="Results"
        )
            DataFrame(request.data["dataset_obj"]).to_excel(writer, index=False, sheet_name="Dataset")
            if synthetic_dataset_obj:
                DataFrame(request.data["synthetic_dataset_obj"]).to_excel(writer, index=False, sheet_name="Synthetic Individual Data")

        binary_stream.seek(0)
        data = BinaryFile(binary_stream, "jonckheere-terpstra-trend-test")
        return Response(data)

    @action(detail=False, methods=["POST"], renderer_classes=(renderers.DocxRenderer,))
    def word(self, request, *args, **kwargs):
        computed_result = request.data.get("computed_result")
        if not computed_result:
            raise exceptions.ValidationError("No Jonckheere Terpstra Trend Test result was computed")
        
        synthetic_dataset_obj = request.data.get("synthetic_dataset_obj")
        synthetic_df = DataFrame(synthetic_dataset_obj) if synthetic_dataset_obj else None

        analysis = DataFrame([computed_result])
        binary_stream = build_jonckheereterpstra_docx(analysis, DataFrame(request.data['dataset_obj']), synthetic_df)
        data = BinaryFile(binary_stream, "jonckheere-terpstra-trend-test")
        return Response(data)


class CochranArmitageViewset(viewsets.GenericViewSet):
    queryset = models.Analysis.objects.none() # not needed
    serializer_class = UnusedSerializer # not needed, pydantic is used instead
    schema = AutoSchema(operation_id_base="CochranArmitage") 

    def _run_analysis(self, request):
        try:
            settings = pydantic_validate(request.data, schema.CochranArmitage)
        except ValidationError as err:
            raise exceptions.ValidationError(err.message) from None
        analysis = settings.calculate()
        return analysis

    def create(self, request, *args, **kwargs):
        analysis = self._run_analysis(request)
        return Response({"answer": analysis})