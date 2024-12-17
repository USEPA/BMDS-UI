import logging
import traceback
import uuid
from copy import deepcopy
from datetime import datetime, timedelta
from io import BytesIO

import pandas as pd
import pydantic
import reversion
from django.conf import settings
from django.core.cache import cache
from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator
from django.db import DataError, models
from django.urls import reverse
from django.utils.text import slugify
from django.utils.timezone import now

import pybmds
from pybmds.batch import BatchBase, BatchSession, MultitumorBatch
from pybmds.constants import ModelClass
from pybmds.recommender.recommender import RecommenderSettings
from pybmds.types.session import VersionSchema

from .. import __version__
from ..common.utils import random_string
from . import constants, tasks, validators
from .executor import AnalysisSession, MultiTumorSession, Session, deserialize
from .reporting import excel
from .reporting.cache import DocxReportCache, ExcelReportCache
from .schema import AnalysisOutput, AnalysisSessionSchema
from .utils import re_hex_color

logger = logging.getLogger(__name__)


def get_deletion_date(current_deletion_date: datetime | None = None) -> datetime | None:
    if settings.IS_DESKTOP:
        return None
    date = now() + timedelta(days=settings.DAYS_TO_KEEP_ANALYSES)
    if current_deletion_date:
        return max(current_deletion_date, date)
    return date


@reversion.register()
class Analysis(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    password = models.CharField(max_length=12, default=random_string, editable=False)
    inputs = models.JSONField(default=dict)
    outputs = models.JSONField(default=dict, blank=True)
    errors = models.JSONField(default=dict, blank=True)
    created = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(null=True, auto_now=True)
    started = models.DateTimeField(null=True, blank=True)
    ended = models.DateTimeField(null=True, blank=True)
    deletion_date = models.DateTimeField(null=True, blank=True, default=get_deletion_date)
    starred = models.BooleanField(default=False)
    collections = models.ManyToManyField("analysis.Collection", related_name="analyses", blank=True)

    class Meta:
        verbose_name_plural = "Analyses"
        ordering = ("-created",)
        get_latest_by = ("created",)

    def __str__(self):
        return str(self.inputs.get("analysis_name", self.id))

    def save(self, *args, **kwargs):
        try:
            super().save(*args, **kwargs)
        except DataError:
            self.reset_execution()
            self.errors = ["An error occurred saving content. Please contact the developers."]
            super().save(*args, **kwargs)
        finally:
            DocxReportCache(analysis=self).delete()
            ExcelReportCache(analysis=self).delete()

    @property
    def slug(self) -> str:
        if "analysis_name" in self.inputs:
            return slugify(self.inputs["analysis_name"])
        else:
            return str(self.id)

    def name(self) -> str:
        return self.inputs.get("analysis_name", "BMDS Analysis")

    def get_absolute_url(self):
        return reverse("analysis", args=(str(self.id),))

    def get_api_url(self):
        return reverse("api:analysis-detail", args=(str(self.id),))

    def get_api_patch_inputs_url(self):
        return reverse("api:analysis-patch-inputs", args=(str(self.id),))

    def get_api_execute_url(self):
        return reverse("api:analysis-execute", args=(str(self.id),))

    def get_api_execute_reset_url(self):
        return reverse("api:analysis-execute-reset", args=(str(self.id),))

    def get_edit_url(self):
        return reverse("analysis_edit", args=(str(self.id), self.password))

    def get_renew_url(self):
        return reverse("analysis_renew", args=(str(self.id), self.password))

    def get_delete_url(self):
        return reverse("analysis_delete", args=(str(self.id), self.password))

    def get_excel_url(self):
        return reverse("api:analysis-excel", args=(str(self.id),))

    def get_word_url(self):
        return reverse("api:analysis-word", args=(str(self.id),))

    def get_star_url(self):
        return reverse("api:analysis-star", args=(str(self.id),))

    def get_clone_url(self):
        return reverse("analysis_clone", args=(str(self.id),))

    def get_collections_url(self):
        return reverse("api:analysis-collections", args=(str(self.id),))

    def inputs_valid(self) -> bool:
        try:
            validators.validate_input(self.inputs)
        except ValidationError:
            return False
        return True

    @property
    def is_executing(self) -> bool:
        return self.started is not None and self.ended is None

    @property
    def is_finished(self) -> bool:
        return self.ended and len(self.outputs) > 0 or len(self.errors) > 0

    @property
    def has_errors(self):
        return len(self.errors) > 0

    @classmethod
    def delete_old_analyses(cls):
        qs = cls.objects.filter(deletion_date__lt=now())
        logger.info(f"Removing {qs.count()} old BMDS analysis")
        qs.delete()

    @classmethod
    def maybe_hanging(cls, queryset):
        """
        Return a queryset of analyses which started at least an hour ago but have not yet ended.
        """
        return queryset.filter(started__lt=now() - timedelta(hours=1), ended__isnull=True)

    @property
    def model_class(self) -> ModelClass:
        return ModelClass(self.inputs["dataset_type"])

    @property
    def model_class_label(self) -> str:
        return constants.model_types[self.inputs["dataset_type"]]

    def get_session(self, index: int) -> Session:
        if not self.is_finished or self.has_errors:
            raise ValueError("Session cannot be returned")
        return deserialize(self.model_class, deepcopy(self.outputs["outputs"][index]))

    def get_sessions(self) -> list[Session]:
        if not self.is_finished or self.has_errors:
            raise ValueError("Session cannot be returned")
        return [
            deserialize(self.model_class, output) for output in deepcopy(self.outputs["outputs"])
        ]

    def to_batch(self) -> BatchBase:
        # convert list[AnalysisSession] to list[pybmds.Session]
        items = []
        sessions = self.get_sessions()

        if self.model_class == ModelClass.MULTI_TUMOR:
            return MultitumorBatch(session.session for session in sessions)

        for session in sessions:
            if session.frequentist:
                items.append(session.frequentist)
            if session.bayesian:
                items.append(session.bayesian)
        return BatchSession(sessions=items)

    def to_df(self) -> dict[str, pd.DataFrame]:
        # exit early if we don't have data for a report
        if not self.is_finished or self.has_errors:
            return {
                "error": pd.Series(
                    data=["Analysis not finished or error occurred - cannot create report"],
                    name="Status",
                ).to_frame(),
            }

        sessions = self.get_sessions()

        if self.model_class == ModelClass.MULTI_TUMOR:
            return {
                "summary": excel.multitumor_summary_df(sessions),
                "datasets": excel.multitumor_dataset_df(sessions),
                "parameters": excel.multitumor_params_df(sessions),
            }

        return {
            "summary": excel.summary_df(sessions),
            "datasets": excel.dataset_df(sessions),
            "parameters": excel.params_df(sessions),
        }

    def to_excel(self) -> BytesIO:
        f = BytesIO()
        with pd.ExcelWriter(f) as writer:
            data = self.to_df()
            for name, df in data.items():
                df.to_excel(writer, sheet_name=name, index=False)
        return f

    def update_selection(self, selection: validators.AnalysisSelectedSchema):
        """Given a new selection data schema; update outputs and save instance

        Args:
            selection (validators.AnalysisSelectedSchema): The selection to update
        """
        for idx, output in enumerate(self.outputs["outputs"]):
            if (
                output["dataset_index"] == selection.dataset_index
                and output["option_index"] == selection.option_index
            ):
                session = self.get_session(idx)
                session.frequentist.selected = selection.selected.deserialize(session)
                self.outputs["outputs"][idx] = session.to_dict()
                self.save()
                break

    def try_execute(self):
        try:
            self.execute()
        except Exception:
            err = traceback.format_exc()
            self.handle_execution_error(err)

    def try_run_session(
        self, inputs: dict, dataset_index: int, option_index: int
    ) -> AnalysisSessionSchema:
        try:
            return AnalysisSession.run(inputs, dataset_index, option_index)
        except Exception:
            response = AnalysisSessionSchema(
                dataset_index=dataset_index, option_index=option_index, error=traceback.format_exc()
            )
            logger.error(f"{self.id}: {response}")
            return response

    def try_run_multitumor(self, inputs: dict, option_index: int) -> AnalysisSessionSchema:
        try:
            return MultiTumorSession.run(inputs, option_index)
        except Exception:
            response = AnalysisSessionSchema(
                dataset_index=-1, option_index=option_index, error=traceback.format_exc()
            )
            logger.error(f"{self.id}: {response}")
            return response

    def start_execute(self):
        # update model to indicate execution scheduled
        self.started = now()
        self.ended = None
        self.save()

        # add to analysis queue...
        tasks.try_execute.delay(str(self.id))

    def _execute_session(self) -> list[AnalysisSessionSchema]:
        # build combinations based on enabled datasets
        combinations = []
        for dataset_index in range(len(self.inputs["datasets"])):
            for option_index in range(len(self.inputs["options"])):
                if self.inputs["dataset_options"][dataset_index]["enabled"]:
                    combinations.append((dataset_index, option_index))

        return [
            self.try_run_session(self.inputs, dataset_index, option_index)
            for dataset_index, option_index in combinations
        ]

    def _execute_multitumor(self) -> list[AnalysisSessionSchema]:
        n_options = len(self.inputs["options"])
        return [
            self.try_run_multitumor(self.inputs, option_index) for option_index in range(n_options)
        ]

    def _execute(self) -> list[AnalysisSessionSchema]:
        is_multitumor = self.inputs.get("dataset_type") == pybmds.constants.ModelClass.MULTI_TUMOR
        if is_multitumor:
            return self._execute_multitumor()
        return self._execute_session()

    def execute(self):
        # update start time to actual time started
        self.started = now()
        outputs = self._execute()
        # get bmds version
        bmds_python_version = None
        for output in outputs:
            if output.frequentist is not None:
                bmds_python_version = output.frequentist["version"]
                break
            if output.bayesian is not None:
                bmds_python_version = output.bayesian["version"]
                break
        # get prepare complete output object
        analysis_output = AnalysisOutput(
            analysis_id=str(self.id),
            bmds_ui_version=__version__,
            bmds_python_version=bmds_python_version,
            outputs=[output.model_dump(by_alias=True) for output in outputs],
        )
        self.outputs = analysis_output.model_dump(by_alias=True)
        self.errors = [output.error for output in outputs if output.error]
        self.ended = now()
        self.deletion_date = get_deletion_date()
        self.save()

    def reset_execution(self):
        """
        Update all modeling results and execution fields to a state where the analysis
        has not yet been executed.
        """
        self.started = None
        self.ended = None
        self.outputs = {}
        self.errors = {}

    def handle_execution_error(self, err):
        self.errors = err
        self.ended = now()
        self.deletion_date = None  # don't delete; save for troubleshooting
        self.save()

    def default_input(self) -> dict:
        return {
            "dataset_type": ModelClass.CONTINUOUS,
            "datasets": [],
            "models": {},
            "dataset_options": [],
            "options": [],
            "recommender": RecommenderSettings.build_default().model_dump(),
        }

    def renew(self):
        self.deletion_date = get_deletion_date(self.deletion_date)

    def get_bmds_version(self) -> VersionSchema | None:
        if not self.is_finished or self.has_errors or self.outputs is None:
            return None
        try:
            return VersionSchema.model_validate(self.outputs["bmds_python_version"])
        except pydantic.ValidationError:
            return None

    @property
    def deletion_date_str(self) -> str | None:
        if self.deletion_date is None:
            return None
        return self.deletion_date.strftime("%B %d, %Y")

    @property
    def days_until_deletion(self) -> int | None:
        if self.deletion_date is None:
            return None
        return (self.deletion_date - now()).days

    @property
    def timestamp(self):
        return self.last_updated or self.ended or self.created


@reversion.register()
class Collection(models.Model):
    name = models.CharField(max_length=128)
    bg_color = models.CharField(
        max_length=7, default="#17A2B8", validators=[RegexValidator(regex=re_hex_color)]
    )
    description = models.TextField(blank=True)
    created = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    @classmethod
    def opts(cls):
        return list(cls.objects.values("id", "name").order_by("name"))


class ContentType(models.IntegerChoices):
    HOMEPAGE = 1


@reversion.register()
class Content(models.Model):
    content_type = models.PositiveIntegerField(choices=ContentType.choices, unique=True)
    subject = models.CharField(max_length=128)
    content = models.JSONField(null=False)
    created = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-created",)

    def __str__(self) -> str:
        return self.subject

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.update_cache()

    def update_cache(self) -> dict:
        key = self.cache_name(self.content_type)
        cache.set(key, self.content, 3600)  # cache for an hour
        return self.content

    @classmethod
    def cache_name(cls, content_type: ContentType) -> str:
        return f"{cls._meta.db_table}-{content_type}"

    @classmethod
    def get_cached_content(cls, content_type: ContentType) -> dict:
        key = cls.cache_name(content_type)
        content = cache.get(key)
        if content is None:
            obj = cls.objects.get(content_type=content_type)
            content = obj.update_cache()
        return content
