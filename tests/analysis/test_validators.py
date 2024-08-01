import json
from copy import deepcopy
from typing import Any

import pytest
from django.core.exceptions import ValidationError
from pydantic import ValidationError as PydanticValidationError

import pybmds
from bmds_ui.analysis import validators
from bmds_ui.analysis.validators import datasets
from pybmds.constants import Dtype, ModelClass


def _missing_field(err, missing_field: str):
    data = json.loads(err.value.message)
    assert data[0]["loc"] == [missing_field]
    assert data[0]["msg"] == "Field required"


class TestInputValidation:
    def test_partial(self):
        data: dict[str, Any] = {
            "dataset_type": Dtype.CONTINUOUS,
        }

        # check minimal passes when partial
        assert validators.validate_input(data, partial=True) is None

        # but fails when complete
        with pytest.raises(ValidationError) as err:
            validators.validate_input(data)
        _missing_field(err, "datasets")

        # add datasets, try again
        data["datasets"] = [
            {
                "dtype": "C",
                "metadata": {"id": 123},
                "doses": [0, 10, 50, 150, 400],
                "ns": [111, 142, 143, 93, 42],
                "means": [2.112, 2.095, 1.956, 1.587, 1.254],
                "stdevs": [0.235, 0.209, 0.231, 0.263, 0.159],
            }
        ]
        data["dataset_options"] = [
            {"dataset_id": 123, "enabled": True, "degree": 0, "adverse_direction": -1}
        ]
        assert validators.validate_input(data, partial=True) is None

        with pytest.raises(ValidationError) as err:
            validators.validate_input(data)
        _missing_field(err, "models")

        # add models, try again
        data["models"] = {"frequentist_restricted": [pybmds.Models.Power]}
        assert validators.validate_input(data, partial=True) is None

        with pytest.raises(ValidationError) as err:
            validators.validate_input(data)
        _missing_field(err, "options")

        # add options, try again
        data["options"] = [
            {
                "bmr_type": 2,
                "bmr_value": 1.0,
                "tail_probability": 0.95,
                "confidence_level": 0.95,
                "dist_type": 1,
            }
        ]
        assert validators.validate_input(data, partial=True) is None
        assert validators.validate_input(data) is None

    def test_recommender(self, complete_dichotomous):
        # ensure recommender is optional
        recommender = complete_dichotomous.pop("recommender")
        assert validators.validate_input(complete_dichotomous) is None

        # but if it's included it validates
        complete_dichotomous["recommender"] = recommender
        assert validators.validate_input(complete_dichotomous) is None

        # but it must be complete if included
        recommender.pop("rules")
        with pytest.raises(ValidationError) as err:
            validators.validate_input(complete_dichotomous)
        _missing_field(err, "rules")

    def test_nested_dichotomous(self, nested_dichotomous_datasets):
        data: dict[str, Any] = {
            "dataset_type": Dtype.NESTED_DICHOTOMOUS,
        }
        assert validators.validate_input(data, partial=True) is None

        # but fails when complete
        with pytest.raises(ValidationError) as err:
            validators.validate_input(data)
        _missing_field(err, "datasets")

        # add datasets, try again
        data["datasets"] = deepcopy(nested_dichotomous_datasets)

        data["dataset_options"] = [{"dataset_id": 123, "enabled": True}]

        assert validators.validate_input(data, partial=True) is None

        with pytest.raises(ValidationError) as err:
            validators.validate_input(data)
        _missing_field(err, "models")

        # add models, try again
        data["models"] = {"frequentist_restricted": [pybmds.Models.NestedLogistic]}
        assert validators.validate_input(data, partial=True) is None

        with pytest.raises(ValidationError) as err:
            validators.validate_input(data)
        _missing_field(err, "options")

        # add options, try again
        data["options"] = [
            {
                "bmr_type": 1,
                "bmr_value": 1.0,
                "confidence_level": 0.95,
                "litter_specific_covariate": 1,
                "bootstrap_iterations": 1000,
                "bootstrap_seed": 0,
            }
        ]
        assert validators.validate_input(data, partial=True) is None
        assert validators.validate_input(data) is None

    def test_multi_tumor(self):
        data: dict[str, Any] = {
            "dataset_type": ModelClass.MULTI_TUMOR,
        }

        assert validators.validate_input(data, partial=True) is None

        # but fails when complete
        with pytest.raises(ValidationError) as err:
            validators.validate_input(data)
        _missing_field(err, "datasets")

        # add datasets, try again
        data["datasets"] = [
            {
                "dtype": "D",
                "metadata": {"id": 123},
                "doses": [0, 10, 50, 150, 400],
                "ns": [20, 20, 20, 20, 20],
                "incidences": [0, 0, 1, 4, 11],
            },
            {
                "dtype": "D",
                "metadata": {"id": 124},
                "doses": [0, 10, 50, 150, 400],
                "ns": [20, 20, 20, 20, 20],
                "incidences": [0, 0, 1, 4, 11],
            },
        ]

        data["dataset_options"] = [
            {"dataset_id": 123, "enabled": True, "degree": 0},
            {"dataset_id": 124, "enabled": True, "degree": 0},
        ]

        assert validators.validate_input(data, partial=True) is None

        with pytest.raises(ValidationError) as err:
            validators.validate_input(data)
        _missing_field(err, "models")

        # add models, try again
        data["models"] = {"frequentist_restricted": [pybmds.Models.Multistage]}
        assert validators.validate_input(data, partial=True) is None

        with pytest.raises(ValidationError) as err:
            validators.validate_input(data)
        _missing_field(err, "options")

        # add options, try again
        data["options"] = [
            {"bmr_type": 1, "bmr_value": 1.0, "confidence_level": 0.95},
        ]
        assert validators.validate_input(data, partial=True) is None
        assert validators.validate_input(data) is None


class TestModelValidation:
    def test_dichotomous(self):
        dtype = Dtype.DICHOTOMOUS
        probit = pybmds.Models.Probit
        logprobit = pybmds.Models.LogProbit

        # test success
        validators.validate_models(dtype, {"frequentist_restricted": [logprobit]})

        # assert wrong model type
        data = {"frequentist_restricted": [pybmds.Models.Power]}
        with pytest.raises(ValidationError) as err:
            validators.validate_models(dtype, data)
        assert "Invalid model(s) in frequentist_restricted: Power" in str(err)

        # assert duplicates model type
        data = {"frequentist_restricted": [logprobit, logprobit]}
        with pytest.raises(ValidationError) as err:
            validators.validate_models(dtype, data)
        assert "Models in frequentist_restricted are not unique" in str(err)

        # assert empty
        data = {"frequentist_restricted": []}
        with pytest.raises(ValidationError) as err:
            validators.validate_models(dtype, data)
        assert "At least one model must be selected" in str(err)

        # assert bayesian duplicates
        data = {
            "bayesian": [
                {"model": probit, "prior_weight": 0.3},
                {"model": logprobit, "prior_weight": 0.4},
                {"model": logprobit, "prior_weight": 0.3},
            ]
        }
        with pytest.raises(ValidationError) as err:
            validators.validate_models(dtype, data)
        assert "Models in bayesian are not unique" in str(err)

        # assert bayesian prior_weight sum
        data = {
            "bayesian": [
                {"model": probit, "prior_weight": 0.5},
                {"model": logprobit, "prior_weight": 0.49},
            ]
        }
        with pytest.raises(ValidationError) as err:
            validators.validate_models(dtype, data)
        assert "Prior weight in bayesian does not sum to 1" in str(err.value)

    def test_continuous(self):
        dtype = Dtype.CONTINUOUS
        power = pybmds.Models.Power
        linear = pybmds.Models.Linear

        # test success
        assert (
            validators.validate_models(
                dtype,
                {"frequentist_restricted": [power]},
            )
            is None
        )

        # assert wrong model type
        with pytest.raises(ValidationError) as err:
            validators.validate_models(
                dtype,
                {"frequentist_restricted": [pybmds.Models.Probit]},
            )
        assert "Invalid model(s) in frequentist_restricted: Probit" in str(err)

        # assert duplicates model type
        with pytest.raises(ValidationError) as err:
            validators.validate_models(
                dtype,
                {"frequentist_restricted": [power, power]},
            )
        assert "Models in frequentist_restricted are not unique" in str(err)

        # assert empty
        with pytest.raises(ValidationError) as err:
            validators.validate_models(
                dtype,
                {"frequentist_restricted": []},
            )
        assert "At least one model must be selected" in str(err)

        # assert bayesian duplicates
        with pytest.raises(ValidationError) as err:
            validators.validate_models(
                dtype,
                {
                    "bayesian": [
                        {"model": power, "prior_weight": 0.3},
                        {"model": linear, "prior_weight": 0.4},
                        {"model": linear, "prior_weight": 0.3},
                    ]
                },
            )
        assert "Models in bayesian are not unique" in str(err)

        # assert bayesian prior_weight sum
        with pytest.raises(ValidationError) as err:
            validators.validate_models(
                dtype,
                {
                    "bayesian": [
                        {"model": power, "prior_weight": 0.5},
                        {"model": linear, "prior_weight": 0.49},
                    ]
                },
            )
        assert "Prior weight in bayesian does not sum to 1" in str(err.value)


class TestOptionSetValidation:
    def test_dichotomous(self):
        # test success
        data = [dict(bmr_type=1, bmr_value=0.1, confidence_level=0.95)]
        assert validators.validate_options(Dtype.DICHOTOMOUS, data) is None

        # must have at least one option
        data = []
        with pytest.raises(ValidationError) as err:
            validators.validate_options(Dtype.DICHOTOMOUS, data)
        assert "List should have at least 1 item" in str(err)

    def test_continuous(self):
        # test success
        data = [
            {
                "bmr_type": 2,
                "bmr_value": 1.0,
                "tail_probability": 0.95,
                "confidence_level": 0.95,
                "dist_type": 1,
            }
        ]
        assert validators.validate_options(Dtype.CONTINUOUS, data) is None

        # must have at least one option
        data = []
        with pytest.raises(ValidationError) as err:
            validators.validate_options(Dtype.CONTINUOUS, data)
        assert "List should have at least 1 item" in str(err)


class TestDatasetValidation:
    def test_dichotomous(self, complete_dichotomous):
        dataset = complete_dichotomous["datasets"][0]

        # check valid
        check = deepcopy(dataset)
        datasets.MaxDichotomousDatasetSchema(**check)

        # check incidence > n
        check = deepcopy(dataset)
        check["incidences"][0] = check["ns"][0] + 1
        with pytest.raises(PydanticValidationError, match="Incidence > N"):
            datasets.MaxDichotomousDatasetSchema(**check)

        # check minimums
        check = deepcopy(dataset)
        check.update(doses=[10] * 3, ns=[10] * 3, incidences=[0] * 3)
        datasets.MaxDichotomousDatasetSchema(**check)

        check = deepcopy(dataset)
        check.update(doses=[0, 1], ns=[1, 1], incidences=[0, 1])
        with pytest.raises(PydanticValidationError, match="At least 3 groups are required"):
            datasets.MaxDichotomousDatasetSchema(**check)

        # check maximums
        check = deepcopy(dataset)
        check.update(doses=[10] * 30, ns=[10] * 30, incidences=[0] * 30)
        datasets.MaxDichotomousDatasetSchema(**check)

        check = deepcopy(dataset)
        check.update(doses=[10] * 31, ns=[10] * 31, incidences=[0] * 31)
        with pytest.raises(PydanticValidationError, match="A maximum of 30 groups are allowed"):
            datasets.MaxDichotomousDatasetSchema(**check)

    def test_continuous(self, complete_continuous):
        dataset = complete_continuous["datasets"][0]

        # check valid
        check = deepcopy(dataset)
        datasets.MaxContinuousDatasetSchema(**check)

        # check minimums
        check = deepcopy(dataset)
        check.update(doses=[10] * 3, ns=[10] * 3, means=[0] * 3, stdevs=[0] * 3)
        datasets.MaxContinuousDatasetSchema(**check)

        check = deepcopy(dataset)
        check.update(doses=[10] * 2, ns=[10] * 2, means=[0] * 2, stdevs=[0] * 2)
        with pytest.raises(PydanticValidationError, match="At least 3 groups are required"):
            datasets.MaxContinuousDatasetSchema(**check)

        check = deepcopy(dataset)
        check.update(doses=[10] * 3, ns=[1] * 3, means=[0] * 3, stdevs=[0] * 3)
        with pytest.raises(PydanticValidationError, match="All N must be ≥ 1"):
            datasets.MaxContinuousDatasetSchema(**check)

        # check maximums
        check = deepcopy(dataset)
        check.update(doses=[10] * 30, ns=[10] * 30, means=[0] * 30, stdevs=[0] * 30)
        datasets.MaxContinuousDatasetSchema(**check)

        check = deepcopy(dataset)
        check.update(doses=[10] * 31, ns=[10] * 31, means=[0] * 31, stdevs=[0] * 31)
        with pytest.raises(PydanticValidationError, match="A maximum of 30 groups are allowed"):
            datasets.MaxContinuousDatasetSchema(**check)

    def test_continuous_individual(self, complete_continuous_individual):
        dataset = complete_continuous_individual["datasets"][0]

        # check valid
        check = deepcopy(dataset)
        datasets.MaxContinuousIndividualDatasetSchema(**check)

        # check minimums
        check = deepcopy(dataset)
        check.update(doses=[1, 1, 2, 2, 3, 3], responses=[10] * 6)
        datasets.MaxContinuousIndividualDatasetSchema(**check)

        check = deepcopy(dataset)
        check.update(doses=[1, 1, 2, 2], responses=[10] * 4)
        with pytest.raises(PydanticValidationError, match="At least 5 groups are required"):
            datasets.MaxContinuousIndividualDatasetSchema(**check)

        check = deepcopy(dataset)
        check.update(doses=[1, 1, 2, 2, 3], responses=[10] * 5)
        with pytest.raises(PydanticValidationError, match="Each dose must have at > 1 response"):
            datasets.MaxContinuousIndividualDatasetSchema(**check)

        # check maximums
        check = deepcopy(dataset)
        doses = list(range(500)) * 2
        check.update(doses=doses, responses=[10] * 1000)
        datasets.MaxContinuousIndividualDatasetSchema(**check)

        check = deepcopy(dataset)
        doses.append(1)
        check.update(doses=doses, responses=[10] * 1001)
        with pytest.raises(PydanticValidationError, match="A maximum of 1000 groups are allowed"):
            datasets.MaxContinuousIndividualDatasetSchema(**check)

    def test_nested_dichotomous(self, nested_dichotomous_datasets):
        dataset = nested_dichotomous_datasets[0]

        # check valid
        check = deepcopy(dataset)
        datasets.MaxNestedDichotomousDatasetSchema(**check)

        # check minimums
        check = deepcopy(dataset)
        check.update(
            doses=[10] * 3, litter_ns=[10] * 3, incidences=[0] * 3, litter_covariates=[0] * 3
        )
        datasets.MaxNestedDichotomousDatasetSchema(**check)

        check = deepcopy(dataset)
        check.update(
            doses=[10] * 2, litter_ns=[10] * 2, incidences=[0] * 2, litter_covariates=[0] * 2
        )
        with pytest.raises(PydanticValidationError, match="At least 3 groups are required"):
            datasets.MaxNestedDichotomousDatasetSchema(**check)

        # check maximums
        check = deepcopy(dataset)
        check.update(
            doses=[10] * 1000,
            litter_ns=[10] * 1000,
            incidences=[0] * 1000,
            litter_covariates=[0] * 1000,
        )
        datasets.MaxNestedDichotomousDatasetSchema(**check)

        check = deepcopy(dataset)
        check.update(
            doses=[10] * 1001,
            litter_ns=[10] * 1001,
            incidences=[0] * 1001,
            litter_covariates=[0] * 1001,
        )
        with pytest.raises(PydanticValidationError, match="A maximum of 1000 groups are allowed"):
            datasets.MaxNestedDichotomousDatasetSchema(**check)
