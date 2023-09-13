import re
from io import StringIO

import pandas as pd
from bmds.bmds3.types.sessions import VersionSchema
from bmds.datasets.transforms.polyk import calculate
from pydantic import BaseModel, Field, validator
from pydantic.schema import schema as pyschema
from rest_framework.schemas.openapi import SchemaGenerator

from .validators import AnalysisSelectedSchema


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
    bmds_server_version: str
    bmds_python_version: VersionSchema | None
    outputs: list[AnalysisSessionSchema]


class PolyKInput(BaseModel):
    dataset: str
    dose_units: str
    power: float = Field(default=3, ge=0, le=5)
    duration: float | None = Field(default=None, gt=0, le=10000)

    @validator("dataset")
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

    def calculate(self) -> tuple[pd.DataFrame, pd.DataFrame]:
        input_df = pd.read_csv(StringIO(self.dataset)).sort_values(["dose", "day"])
        (df1, df2) = calculate(
            doses=input_df.dose.tolist(),
            day=input_df.day.tolist(),
            has_tumor=input_df.has_tumor.tolist(),
            k=self.power,
            max_day=self.duration,
        )
        return (df1, df2)


def add_schemas(schema: dict, models: list):
    additions = pyschema(models, ref_prefix="#/components/schemas/")
    for key, value in additions["definitions"].items():
        schema["components"]["schemas"][key] = value


def add_schema_to_path(schema: dict, path: str, verb: str, name: str):
    body = schema["paths"][path][verb]["requestBody"]
    for content_type in body["content"].values():
        content_type["schema"]["$ref"] = f"#/components/schemas/{name}"


class ApiSchemaGenerator(SchemaGenerator):
    def get_schema(self, *args, **kwargs):
        schema = super().get_schema(*args, **kwargs)
        add_schemas(schema, [EditKeySchema, WrappedAnalysisSelectedSchema])
        add_schema_to_path(schema, "/api/v1/analysis/{id}/execute/", "post", EditKeySchema.__name__)
        add_schema_to_path(
            schema, "/api/v1/analysis/{id}/execute-reset/", "post", EditKeySchema.__name__
        )
        add_schema_to_path(
            schema,
            "/api/v1/analysis/{id}/select-model/",
            "post",
            WrappedAnalysisSelectedSchema.__name__,
        )
        return schema
