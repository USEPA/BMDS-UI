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

limits = {
    "MCMC": {
        "iterations": {
            "max_total_iterations": 50_000,
            "min_per_chain": 10_000
        }, 
        "seed": {
            "min": 0, 
            "max": 2_147_483_647
        }, 
        "burnin": {
            "max_percent": 0.2, 
            "min": 1000
        },
        "chain": {
            "min": 0, 
            "max": 4
        }
    }, 
    "NestedDichotomous": {
        "BootstrapIterations": {
            "min": 10, 
            "max": 10_000
        }, 
        "BootstrapSeed": {
            "min": 0, 
            "max": 1000
        }
    }
}

MCMC_limits = limits["MCMC"]
ND_limits = limits["NestedDichotomous"]

def get_max_iterations(n_chains: int) -> int:
    return MCMC_limits["iterations"]["max_total_iterations"] // n_chains

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
    min_v = ND_limits["BootstrapIterations"]["min"]
    max_v = ND_limits["BootstrapIterations"]["max"]
    if not (min_v <= v <= max_v):
        raise PydanticCustomError(
            "bootstrap_iterations_range",
            "Bootstrap Interations must be between {min} and {max} (inclusive); got {value}.",
            {"min": f"{min_v:,}", "max": f"{max_v:,}", "value": f"{v:,}"}
        )
    return v

BootstrapIterations = Annotated[int, AfterValidator(_check_bootstrap_iterations)]

def _check_bootstrap_seed(v: int) -> int:
    min_v = ND_limits["BootstrapSeed"]["min"]
    max_v = ND_limits["BootstrapSeed"]["max"]
    if not (min_v <= v <= max_v):
        raise PydanticCustomError(
            "bootstrap_seed_range",
            "Bootstrap Seed must be between {min} and {max} (inclusive); got {value}.",
            {"min": f"{min_v:,}", "max": f"{max_v:,}", "value": f"{v:,}"}
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
    seed: int = Field(ge=MCMC_limits["seed"]["min"], le=MCMC_limits["seed"]["max"])
    n_chains: int = Field(ge=MCMC_limits["chain"]["min"], le=MCMC_limits["chain"]["max"])
    iterations_per_chain: int = Field(ge=MCMC_limits["iterations"]["min_per_chain"])
    burnin: int = Field(ge=MCMC_limits["burnin"]["min"])

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
        n_chains = info.data.get("n_chains")
        iterations_per_chain = info.data.get("iterations_per_chain")
        if n_chains is not None and iterations_per_chain is not None:
            total_iterations = n_chains * iterations_per_chain
            max_burnin_percent = MCMC_limits["burnin"]["max_percent"]
            max_burnin = int(max_burnin_percent * total_iterations)
            if v > max_burnin:
                raise PydanticCustomError(
                    "burnin_max",
                    f"burn in cannot exceed {max_burnin:,} ({int(max_burnin_percent * 100)}% of total iterations: {total_iterations:,}); got {v:,}."
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
