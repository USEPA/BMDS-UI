import logging
import re
from copy import deepcopy
from datetime import datetime
from io import StringIO
from typing import ClassVar
from uuid import UUID

import pandas as pd
from pydantic import BaseModel, Field, ValidationError, field_validator
from rest_framework.schemas.openapi import SchemaGenerator

from pybmds.datasets.transforms.polyk import PolyKAdjustment
from pybmds.types.session import VersionSchema

from .validators import AnalysisSelectedSchema

logger = logging.getLogger(__name__)


class EditKeySchema(BaseModel):
    editKey: str


class WrappedAnalysisSelectedSchema(BaseModel):
    editKey: str
    data: AnalysisSelectedSchema


class AnalysisSessionSchema(BaseModel):
    dataset_index: int
    option_index: int
    frequentist: dict | None = None
    bayesian: dict | None = None
    error: str | None = None


class AnalysisOutput(BaseModel):
    analysis_id: str
    analysis_schema_version: str = "1.1"
    bmds_ui_version: str
    bmds_python_version: VersionSchema | None = None
    outputs: list[AnalysisSessionSchema]


class PolyKInput(BaseModel):
    dataset: str
    dose_units: str
    power: float = Field(default=3, ge=0, le=5)
    duration: float | None = Field(default=None, gt=0, le=10000)

    @field_validator("dataset")
    @classmethod
    def check_dataset(cls, value):
        if len(value) > 100_000:
            raise ValueError("Dataset too large")

        # replace tabs or spaces with commas
        value = re.sub(r"[,\t ]+", ",", value.strip())

        df = pd.read_csv(StringIO(value))

        required_columns = ["dose", "day", "has_tumor"]
        if df.columns.tolist() != required_columns:
            raise ValueError(f"Bad column names; requires {required_columns}")

        if not (df.dose >= 0).all():
            raise ValueError("`doses` must be ≥ 0")

        if not (df.day >= 0).all():
            raise ValueError("`day` must be ≥ 0")

        has_tumor_set = set(df.has_tumor.unique())
        if has_tumor_set != {0, 1}:
            raise ValueError("`has_tumor` must include only the values {0, 1}")

        return value

    def calculate(self) -> PolyKAdjustment:
        input_df = pd.read_csv(StringIO(self.dataset)).sort_values(["dose", "day"])
        return PolyKAdjustment(
            doses=input_df.dose.tolist(),
            day=input_df.day.tolist(),
            has_tumor=input_df.has_tumor.tolist(),
            k=self.power,
            max_day=self.duration,
            dose_units=self.dose_units,
        )


def add_schemas(schema: dict, models: list):
    for model in models:
        schema["components"]["schemas"][model.__name__] = model.model_json_schema(
            ref_template=f"#/components/schemas/{model}"
        )


def add_schema_to_path(schema: dict, path: str, verb: str, name: str):
    body = schema["paths"][path][verb]["requestBody"]
    for content_type in body["content"].values():
        content_type["schema"]["$ref"] = f"#/components/schemas/{name}"


class ApiSchemaGenerator(SchemaGenerator):
    pass


class Analysis(BaseModel):
    id: UUID
    inputs: dict
    errors: list[dict]
    outputs: AnalysisOutput
    collections: list
    is_executing: bool
    is_finished: bool
    has_errors: bool
    inputs_valid: bool
    api_url: str
    excel_url: str
    word_url: str
    created: datetime
    started: datetime
    ended: datetime
    starred: bool


class AnalysisMigration(BaseModel):
    initial: dict
    initial_version: str
    analysis: Analysis
    version: str


class SchemaMigrationException(Exception):
    pass


class AnalysisMigrator:
    migration_chain: ClassVar = ["1.0", "1.1"]

    @classmethod
    def migrate(cls, data: dict) -> AnalysisMigration:
        if not isinstance(data, dict):
            raise SchemaMigrationException("Data must be a dictionary")

        initial_version = data.get("outputs", {}).get("analysis_schema_version")
        if initial_version is None or initial_version not in cls.migration_chain:
            raise SchemaMigrationException("Cannot migrate; invalid version")

        initial = deepcopy(data)
        initial_index = cls.migration_chain.index(initial_version)
        for idx in range(initial_index + 1, len(cls.migration_chain)):
            migration = cls.migration_chain[idx]
            func = f"to_{migration.replace('.', '_')}"
            try:
                data = getattr(cls, func)(data)
            except Exception as err:
                raise SchemaMigrationException("Cannot migrate; invalid data") from err

        try:
            analysis = Analysis.model_validate(data)
        except ValidationError as err:
            raise SchemaMigrationException("Cannot migrate; invalid data") from err

        return AnalysisMigration(
            initial=initial,
            initial_version=initial_version,
            analysis=analysis,
            version=analysis.outputs.analysis_schema_version,
        )

    @classmethod
    def to_1_1(cls, data: dict) -> dict:
        logger.debug("Migrating from 1.0 to 1.1")
        return data
