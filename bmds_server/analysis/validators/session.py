from typing import Any, Literal

import bmds
from django.conf import settings
from pydantic import BaseModel, Field

from ...common.validation import pydantic_validate

_versions = Literal[bmds.constants.BMDS330]


class BaseSession(BaseModel):
    id: int | str | None
    bmds_version: _versions
    description: str = ""
    dataset_type: bmds.constants.ModelClass


max_items = 1000 if settings.IS_DESKTOP else 10


class BaseSessionComplete(BaseSession):
    datasets: list[Any] = Field(min_items=1, max_items=max_items)
    models: dict
    options: list[Any] = Field(min_items=1, max_items=max_items)


def validate_session(data: dict, partial: bool = False):
    schema = BaseSession if partial else BaseSessionComplete
    pydantic_validate(data, schema)
