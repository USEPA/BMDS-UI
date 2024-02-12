from typing import Any

import bmds
from bmds.constants import DistType
from bmds.types.continuous import ContinuousRiskType
from bmds.types.dichotomous import DichotomousRiskType
from bmds.types.nested_dichotomous import LitterSpecificCovariate
from django.conf import settings
from django.core.exceptions import ValidationError
from pydantic import BaseModel, Field

from ...common.validation import pydantic_validate

max_length = 1000 if settings.IS_DESKTOP else 6


class DichotomousOption(BaseModel):
    bmr_type: DichotomousRiskType
    bmr_value: float
    confidence_level: float = Field(gt=0.5, lt=1)


class ContinuousOption(BaseModel):
    bmr_type: ContinuousRiskType
    bmr_value: float
    tail_probability: float = Field(gt=0, lt=1)
    confidence_level: float = Field(gt=0.5, lt=1)
    dist_type: DistType


class NestedDichotomousOption(BaseModel):
    bmr_type: DichotomousRiskType
    bmr_value: float
    confidence_level: float = Field(gt=0.5, lt=1)
    litter_specific_covariate: LitterSpecificCovariate
    bootstrap_iterations: int
    bootstrap_seed: int


class DichotomousOptions(BaseModel):
    options: list[DichotomousOption] = Field(min_length=1, max_length=max_length)


class ContinuousOptions(BaseModel):
    options: list[ContinuousOption] = Field(min_length=1, max_length=max_length)


class NestedDichotomousOptions(BaseModel):
    options: list[NestedDichotomousOption] = Field(min_length=1, max_length=max_length)


def validate_options(dataset_type: str, data: Any):
    if dataset_type in bmds.constants.DICHOTOMOUS_DTYPES:
        schema = DichotomousOptions
    elif dataset_type in bmds.constants.CONTINUOUS_DTYPES:
        schema = ContinuousOptions
    elif dataset_type == bmds.constants.NESTED_DICHOTOMOUS:
        schema = NestedDichotomousOptions
    elif dataset_type == bmds.constants.MULTI_TUMOR:
        schema = DichotomousOptions
    else:
        ValidationError(f"Unknown `dataset_type`: {dataset_type}")

    pydantic_validate({"options": data}, schema)
