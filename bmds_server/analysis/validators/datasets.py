from enum import IntEnum
from typing import Any, ClassVar

import bmds
from bmds.datasets.continuous import ContinuousDatasetSchema, ContinuousIndividualDatasetSchema
from bmds.datasets.dichotomous import DichotomousDatasetSchema
from bmds.datasets.nested_dichotomous import NestedDichotomousDatasetSchema
from django.conf import settings
from django.core.exceptions import ValidationError
from pydantic import BaseModel, Field, model_validator

from ...common.validation import pydantic_validate

max_length = 1000 if settings.IS_DESKTOP else 10


class MaxDegree(IntEnum):
    N_MINUS_ONE = 0
    ONE = 1
    TWO = 2
    THREE = 3
    FOUR = 4
    FIVE = 5
    SIX = 6
    SEVEN = 7
    EIGHT = 8


class AdverseDirection(IntEnum):
    AUTOMATIC = -1
    UP = 1
    DOWN = 0


class DichotomousModelOptions(BaseModel):
    dataset_id: int
    enabled: bool = True
    degree: MaxDegree = MaxDegree.N_MINUS_ONE


class ContinuousModelOptions(BaseModel):
    dataset_id: int
    enabled: bool = True
    adverse_direction: AdverseDirection = AdverseDirection.AUTOMATIC
    degree: MaxDegree = MaxDegree.N_MINUS_ONE


class NestedDichotomousModelOptions(BaseModel):
    dataset_id: int
    enabled: bool = True


class DatasetValidator(BaseModel):
    @model_validator(mode="after")
    def check_id_matches(self):
        dataset_ids = [dataset.metadata.id for dataset in self.datasets]
        ds_option_ids = [opt.dataset_id for opt in self.dataset_options]
        if len(set(dataset_ids)) != len(dataset_ids):
            raise ValueError("Dataset IDs are not unique")
        if set(dataset_ids) != set(ds_option_ids):
            raise ValueError("Dataset IDs are not the same as dataset option IDs")
        return self


class MaxDichotomousDatasetSchema(DichotomousDatasetSchema):
    MAX_N: ClassVar = 30


class MaxContinuousDatasetSchema(ContinuousDatasetSchema):
    MAX_N: ClassVar = 30


class MaxContinuousIndividualDatasetSchema(ContinuousIndividualDatasetSchema):
    MIN_N: ClassVar = 5
    MAX_N: ClassVar = 1000


class MaxNestedDichotomousDatasetSchema(NestedDichotomousDatasetSchema):
    MAX_N: ClassVar = 1000


class DichotomousDatasets(DatasetValidator):
    dataset_options: list[DichotomousModelOptions] = Field(min_length=1, max_length=max_length)
    datasets: list[MaxDichotomousDatasetSchema] = Field(min_length=1, max_length=max_length)


class ContinuousDatasets(DatasetValidator):
    dataset_options: list[ContinuousModelOptions] = Field(min_length=1, max_length=max_length)
    datasets: list[MaxContinuousDatasetSchema | MaxContinuousIndividualDatasetSchema] = Field(
        min_length=1,
        max_length=max_length,
    )


class NestedDichotomousDataset(DatasetValidator):
    dataset_options: list[NestedDichotomousModelOptions] = Field(
        min_length=1, max_length=max_length
    )
    datasets: list[MaxNestedDichotomousDatasetSchema] = Field(min_length=1, max_length=max_length)


class MultiTumorDatasets(DatasetValidator):
    dataset_options: list[DichotomousModelOptions] = Field(min_length=1, max_length=max_length)
    datasets: list[DichotomousDatasetSchema] = Field(min_length=1, max_length=max_length)


def validate_datasets(dataset_type: str, datasets: Any, datasetOptions: Any):
    if dataset_type in bmds.constants.CONTINUOUS_DTYPES:
        schema = ContinuousDatasets
    elif dataset_type in bmds.constants.DICHOTOMOUS_DTYPES:
        schema = DichotomousDatasets
    elif dataset_type == bmds.constants.NESTED_DICHOTOMOUS:
        schema = NestedDichotomousDataset
    elif dataset_type == bmds.constants.MULTI_TUMOR:
        schema = MultiTumorDatasets
    else:
        raise ValidationError(f"Unknown dataset type: {dataset_type}")

    data = {"datasets": datasets, "dataset_options": datasetOptions}
    pydantic_validate(data, schema)
