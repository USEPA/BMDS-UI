from typing import Any

import numpy as np
from django.core.exceptions import ValidationError
from pydantic import BaseModel, Field, model_validator

from pybmds.constants import Dtype, ModelClass, Models

from ...common.validation import pydantic_validate


class ModelTypeSchema(BaseModel):
    restricted: set[str]
    unrestricted: set[str]
    toxicr_bayesian: set[str]
    loud_bayesian: set[str]


DichotomousModelSchema = ModelTypeSchema(
    restricted={
        Models.DichotomousHill,
        Models.Gamma,
        Models.LogLogistic,
        Models.LogProbit,
        Models.Multistage,
        Models.Weibull,
    },
    unrestricted={
        Models.DichotomousHill,
        Models.Gamma,
        Models.Logistic,
        Models.LogLogistic,
        Models.LogProbit,
        Models.Multistage,
        Models.Probit,
        Models.QuantalLinear,
        Models.Weibull,
    },
    toxicr_bayesian={
        Models.DichotomousHill,
        Models.Gamma,
        Models.Logistic,
        Models.LogLogistic,
        Models.LogProbit,
        Models.Multistage,
        Models.Probit,
        Models.QuantalLinear,
        Models.Weibull,
    },
    loud_bayesian={
        Models.DichotomousHill,
        Models.Gamma,
        Models.Logistic,
        Models.LogLogistic,
        Models.LogProbit,
        Models.Multistage,
        Models.Probit,
        Models.QuantalLinear,
        Models.Weibull,
    }
)

ContinuousModelSchema = ModelTypeSchema(
    restricted={Models.ExponentialM3, Models.ExponentialM5, Models.Hill, Models.Polynomial, Models.Power},
    unrestricted={Models.Hill, Models.Linear, Models.Polynomial, Models.Power},
    toxicr_bayesian=set(), # Continuous model does not support toxicR Bayesian
    loud_bayesian={Models.ExponentialM3, Models.ExponentialM5, Models.Hill, Models.Linear, Models.Polynomial, Models.Power},
)

NestedDichotomousModelSchema = ModelTypeSchema(
    restricted={Models.NestedLogistic, Models.NCTR},
    unrestricted={Models.NestedLogistic, Models.NCTR},
    toxicr_bayesian=set(),
    loud_bayesian=set(),
)

MultiTumorModelSchema = ModelTypeSchema(
    restricted={Models.Multistage},
    unrestricted=set(),
    toxicr_bayesian=set(),
    loud_bayesian=set(),
)

class BayesianModelSchema(BaseModel):
    model: str
    prior_weight: float = Field(ge=0, le=1)
    dist_type: int | None = None

class ModelListSchema(BaseModel):
    frequentist_restricted: list[str] = []
    frequentist_unrestricted: list[str] = []
    toxicr_bayesian: list[BayesianModelSchema] = []
    loud_bayesian: list[BayesianModelSchema] = []
    bmds_model_schema: ModelTypeSchema = Field(alias="model_schema")

    @staticmethod
    def _ensure_sum_to_one(seq, err_msg):
        if len(seq) > 0:
            weights = sum(b.prior_weight for b in seq)
            if not np.isclose(weights, 1.0, atol=0.005):
                raise ValueError(err_msg)

    @model_validator(mode="after")
    def bayesian_weights(self):
        self._ensure_sum_to_one(self.loud_bayesian, "Prior weight in loud bayesian does not sum to 1") 
        self._ensure_sum_to_one(self.toxicr_bayesian, "Prior weight in toxicr bayesian does not sum to 1") 
        return self
    
    @model_validator(mode="after")
    def uniqueness(self):
        schema = self.bmds_model_schema
        for field, valid_models in [
            ("frequentist_restricted", schema.restricted),
            ("frequentist_unrestricted", schema.unrestricted),
        ]:
            models = getattr(self, field)
            if len(models) != len(set(models)):
                raise ValueError(f"Models in {field} are not unique")
            extras = list(set(models) - valid_models)
            if len(extras) > 0:
                raise ValueError(f"Invalid model(s) in {field}: {','.join(extras)}")

        for field, valid_models in [
            ("toxicr_bayesian", schema.toxicr_bayesian),
            ("loud_bayesian", schema.loud_bayesian),
        ]:
            entries = getattr(self, field)
            models = [entry.model for entry in entries]
            extras = list(set(models) - valid_models)

            if len(extras) > 0:
                raise ValueError(f"Invalid model(s) in {field}: {','.join(extras)}")
            
            if field == "loud_bayesian":
                pairs = [(entry.model, entry.dist_type) for entry in entries]
                if len(pairs) != len(set(pairs)):
                    raise ValueError(f"Model/dist_type combinations in {field} are not unique")
            else:
                if len(models) != len(set(models)):
                    raise ValueError(f"Models in {field} are not unique")
        return self

    @model_validator(mode="after")
    def at_least_one(self):
        num_models = (
            len(self.frequentist_restricted)
            + len(self.frequentist_unrestricted)
            + len(self.toxicr_bayesian)
            + len(self.loud_bayesian)
        )
        if num_models == 0:
            raise ValueError("At least one model must be selected")
        return self


class DichotomousModelListSchema(ModelListSchema):
    bmds_model_schema: ModelTypeSchema = DichotomousModelSchema


class ContinuousModelListSchema(ModelListSchema):
    bmds_model_schema: ModelTypeSchema = ContinuousModelSchema


class NestedDichotomousModelListSchema(ModelListSchema):
    bmds_model_schema: ModelTypeSchema = NestedDichotomousModelSchema


class MultiTumorModelListSchema(ModelListSchema):
    bmds_model_schema: ModelTypeSchema = MultiTumorModelSchema


schema_map = {
    Dtype.DICHOTOMOUS: DichotomousModelListSchema,
    Dtype.CONTINUOUS: ContinuousModelListSchema,
    Dtype.CONTINUOUS_INDIVIDUAL: ContinuousModelListSchema,
    Dtype.NESTED_DICHOTOMOUS: NestedDichotomousModelListSchema,
    ModelClass.MULTI_TUMOR: MultiTumorModelListSchema,
}


def validate_models(dataset_type: str, data: Any):
    schema = schema_map.get(dataset_type)
    if schema is None:
        raise ValidationError(f"Unknown `dataset_type`: {dataset_type}")
    pydantic_validate(data, schema)
