from typing import Any, Annotated

from django.conf import settings
from django.core.exceptions import ValidationError
from pydantic import BaseModel, Field, field_validator, AfterValidator
from pydantic_core import PydanticCustomError

import pybmds
from pybmds.constants import DistType
from pybmds.types.continuous import ContinuousRiskType
from pybmds.types.dichotomous import DichotomousRiskType
from pybmds.types.nested_dichotomous import LitterSpecificCovariate

from ...common.validation import pydantic_validate

max_length = 1000 if settings.IS_DESKTOP else 6

MAX_TOTAL_ITERATIONS = 50_000

def get_max_iterations(n_chains: int) -> int:
    return MAX_TOTAL_ITERATIONS // n_chains

# VALIDATION LIMITS AND ERROR MESSAGES ======================================================
def _check_confidence_level(v: float) -> float:
    if not (0.5 < v < 1):
        raise PydanticCustomError(
            "confidence_level_range",
            "Confidence level must be between 0.5 and 1 (exclusive); got {value}.",
            {"value": v}
        )
    return v

ConfidenceLevel = Annotated[float, AfterValidator(_check_confidence_level)]

def _check_tail_probability(v: float) -> float:
    if not (0 < v < 1):
        raise PydanticCustomError(
            "tail_probability_range",
            "Tail Probability must be between 0 and 1 (exclusive); got {value}.",
            {"value": v}
        )
    return v

TailProbability = Annotated[float, AfterValidator(_check_tail_probability)]

def _check_bmr_value(v: float) -> float:
    if not (0 < v):
        raise PydanticCustomError(
            "bmr",
            "BMR must be greater than 0; got {value}.",
            {"value": v}
        )
    return v

BmrValue = Annotated[float, AfterValidator(_check_bmr_value)]

def _check_bootstrap_iterations(v: int) -> int:
    if not (10 <= v <= 10_000):
        raise PydanticCustomError(
            "bootstrap_iterations_range",
            "Bootstrap Interations must be between 10 and 10,000 (inclusive); got {value}.",
            {"value": v}
        )
    return v

BootstrapIterations = Annotated[int, AfterValidator(_check_bootstrap_iterations)]

def _check_bootstrap_seed(v: int) -> int:
    if not (0 <= v <= 1_000):
        raise PydanticCustomError(
            "bootstrap_seed_range",
            "Bootstrap Seed must be between 1 and 1,000 (inclusive); got {value}.",
            {"value": v}
        )
    return v

BootstrapSeed = Annotated[int, AfterValidator(_check_bootstrap_seed)]

# =========================================================================================

class DichotomousOption(BaseModel):
    bmr_type: DichotomousRiskType
    bmr_value: BmrValue
    confidence_level: ConfidenceLevel

class ContinuousOption(BaseModel):
    bmr_type: ContinuousRiskType
    bmr_value: BmrValue
    tail_probability: TailProbability
    confidence_level: ConfidenceLevel
    dist_type: DistType

class NestedDichotomousOption(BaseModel):
    bmr_type: DichotomousRiskType
    bmr_value: BmrValue
    confidence_level: ConfidenceLevel
    litter_specific_covariate: LitterSpecificCovariate
    bootstrap_iterations: BootstrapIterations
    bootstrap_seed: BootstrapSeed
    estimate_background: bool

class mcmcOption(BaseModel):
    seed: int = Field(ge=0, le=2_147_483_647)
    n_chains: int = Field(ge=1, le=4)
    iterations_per_chain: int = Field(ge=10_000)
    burnin: int = Field(ge=1_000)

    @field_validator("iterations_per_chain", mode="after")
    @classmethod
    def iterations_per_chain_max(cls, v, info):
        n_chains = info.data.get("n_chains")
        max_iterations = get_max_iterations(n_chains) if n_chains is not None else None
        if max_iterations is not None and v > max_iterations:
            raise PydanticCustomError(
                "iterations_per_chain_max",
                f"With {n_chains} chain(s), iterations per chain cannot exceed {max_iterations:,}; got {v:,}."
            )
        return v
    
    @field_validator("burnin", mode="after")
    @classmethod
    def burnin_max(cls, v, info):
        print(info)
        n_chains = info.data.get("n_chains")
        iterations_per_chain = info.data.get("iterations_per_chain")
        if n_chains is not None and iterations_per_chain is not None:
            total_iterations = n_chains * iterations_per_chain
            max_burnin = int(0.2 * total_iterations)
            if v > max_burnin:
                raise PydanticCustomError(
                    "burnin_max",
                    f"burn in cannot exceed {max_burnin:,} (20% of total iterations: {total_iterations:,}); got {v:,}."
                )
        return v

class DichotomousOptions(BaseModel):
    options: list[DichotomousOption] = Field(min_length=1, max_length=max_length)

class ContinuousOptions(BaseModel):
    options: list[ContinuousOption] = Field(min_length=1, max_length=max_length)

class NestedDichotomousOptions(BaseModel):
    options: list[NestedDichotomousOption] = Field(min_length=1, max_length=max_length)

def validate_options(dataset_type: str, data: Any):
    if dataset_type in pybmds.constants.ModelClass.DICHOTOMOUS:
        schema = DichotomousOptions
    elif dataset_type in pybmds.constants.ModelClass.CONTINUOUS:
        schema = ContinuousOptions
    elif dataset_type == pybmds.constants.ModelClass.NESTED_DICHOTOMOUS:
        schema = NestedDichotomousOptions
    elif dataset_type == pybmds.constants.ModelClass.MULTI_TUMOR:
        schema = DichotomousOptions
    else:
        raise ValidationError(f"Unknown `dataset_type`: {dataset_type}")

    pydantic_validate({"options": data}, schema)

def validate_mcmc_options(data: Any):
    pydantic_validate(data, mcmcOption)
