from enum import StrEnum
from typing import Any

import bmds
from django.conf import settings
from pydantic import BaseModel, Field

from ...common.validation import pydantic_validate


class BmdsVersion(StrEnum):
    BMDS330: str = "BMDS330"
    BMDS232: str = "23.2"
    BMDS24: str = "24.1a"


class BaseSession(BaseModel):
    id: int | str | None = None
    bmds_version: BmdsVersion
    description: str = ""
    dataset_type: bmds.constants.ModelClass


max_length = 1000 if settings.IS_DESKTOP else 10


class BaseSessionComplete(BaseSession):
    datasets: list[Any] = Field(min_length=1, max_length=max_length)
    models: dict
    options: list[Any] = Field(min_length=1, max_length=max_length)


def validate_session(data: dict, partial: bool = False):
    schema = BaseSession if partial else BaseSessionComplete
    pydantic_validate(data, schema)
