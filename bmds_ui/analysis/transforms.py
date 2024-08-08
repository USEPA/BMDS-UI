from enum import StrEnum

import pybmds
from pybmds.constants import Dtype
from pybmds.types.continuous import ContinuousModelSettings
from pybmds.types.dichotomous import DichotomousModelSettings
from pybmds.types.nested_dichotomous import NestedDichotomousModelSettings
from pybmds.types.priors import PriorClass

from .validators.datasets import AdverseDirection


class PriorEnum(StrEnum):
    frequentist_restricted = "frequentist_restricted"
    frequentist_unrestricted = "frequentist_unrestricted"
    bayesian = "bayesian"


bmd3_prior_map: dict[str, PriorClass] = {
    PriorEnum.frequentist_restricted: PriorClass.frequentist_restricted,
    PriorEnum.frequentist_unrestricted: PriorClass.frequentist_unrestricted,
    PriorEnum.bayesian: PriorClass.bayesian,
}
is_increasing_map = {
    AdverseDirection.AUTOMATIC: None,
    AdverseDirection.UP: True,
    AdverseDirection.DOWN: False,
}


def build_model_settings(
    dataset_type: str,
    prior_class: str,
    options: dict,
    dataset_options: dict,
) -> DichotomousModelSettings | ContinuousModelSettings | NestedDichotomousModelSettings:
    prior_cls = bmd3_prior_map[prior_class]
    if dataset_type == pybmds.constants.Dtype.DICHOTOMOUS:
        return DichotomousModelSettings(
            bmr=options["bmr_value"],
            alpha=round(1.0 - options["confidence_level"], 3),
            bmr_type=options["bmr_type"],
            degree=dataset_options["degree"],
            priors=prior_cls,
        )
    elif dataset_type in pybmds.constants.Dtype.CONTINUOUS_DTYPES():
        return ContinuousModelSettings(
            bmr=options["bmr_value"],
            alpha=round(1.0 - options["confidence_level"], 3),
            tail_prob=options["tail_probability"],
            bmr_type=options["bmr_type"],
            disttype=options["dist_type"],
            degree=dataset_options["degree"],
            is_increasing=is_increasing_map[dataset_options["adverse_direction"]],
            priors=prior_cls,
        )
    elif dataset_type == pybmds.constants.Dtype.NESTED_DICHOTOMOUS:
        return NestedDichotomousModelSettings(
            bmr_type=options["bmr_type"],
            bmr=options["bmr_value"],
            alpha=round(1.0 - options["confidence_level"], 3),
            litter_specific_covariate=options["litter_specific_covariate"],
            bootstrap_iterations=options["bootstrap_iterations"],
            bootstrap_seed=options["bootstrap_seed"],
            priors=prior_cls,
        )
    elif dataset_type == pybmds.constants.ModelClass.MULTI_TUMOR:
        return DichotomousModelSettings(
            bmr_type=options["bmr_type"],
            bmr=options["bmr_value"],
            alpha=round(1.0 - options["confidence_level"], 3),
            degree=2,
            priors=PriorClass.frequentist_restricted,
        )
    else:
        raise ValueError(f"Unknown dataset_type: {dataset_type}")


def build_dataset(dataset: dict[str, list[float]]) -> pybmds.datasets.base.DatasetBase:
    dataset_type = dataset["dtype"]
    if dataset_type == Dtype.CONTINUOUS:
        schema = pybmds.datasets.continuous.ContinuousDatasetSchema
    elif dataset_type == Dtype.CONTINUOUS_INDIVIDUAL:
        schema = pybmds.datasets.continuous.ContinuousIndividualDatasetSchema
    elif dataset_type == Dtype.DICHOTOMOUS:
        schema = pybmds.datasets.dichotomous.DichotomousDatasetSchema
    elif dataset_type == Dtype.NESTED_DICHOTOMOUS:
        schema = pybmds.datasets.nested_dichotomous.NestedDichotomousDatasetSchema
    else:
        raise ValueError(f"Unknown dataset type: {dataset_type}")
    return schema.model_validate(dataset).deserialize()


def remap_exponential(models: list[str]) -> list[str]:
    # expand user-specified "exponential" model into M3 and M5
    if pybmds.Models.Exponential in models:
        models = models.copy()  # return a copy so inputs are unchanged
        pos = models.index(pybmds.Models.Exponential)
        models[pos : pos + 1] = (
            pybmds.Models.ExponentialM3,
            pybmds.Models.ExponentialM5,
        )
    return models
