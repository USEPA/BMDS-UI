from typing import Any

import bmds
from bmds.bmds3.constants import DistType
from bmds.bmds3.types.continuous import ContinuousRiskType
from bmds.bmds3.types.dichotomous import DichotomousRiskType
from bmds.bmds3.types.nested_dichotomous import LitterSpecificCovariate
from django.core.exceptions import ValidationError
from pydantic import BaseModel, Field, conlist

from ...common.validation import pydantic_validate


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
    options: conlist(DichotomousOption, min_items=1, max_items=10)


class ContinuousOptions(BaseModel):
    options: conlist(ContinuousOption, min_items=1, max_items=10)


class NestedDichotomousOptions(BaseModel):
    options: conlist(NestedDichotomousOption, min_items=1, max_items=3)


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
