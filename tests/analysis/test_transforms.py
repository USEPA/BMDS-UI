import pytest

import pybmds
from bmds_ui.analysis import transforms
from pybmds.constants import Models
from pybmds.types.continuous import ContinuousRiskType
from pybmds.types.dichotomous import DichotomousRiskType


class TestOptions:
    def test_options_continuous(self):
        options = {
            "bmr_type": 2,
            "bmr_value": 1.5,
            "tail_probability": 0.4,
            "confidence_level": 0.95,
            "dist_type": 1,
        }
        dataset_options = {"dataset_id": 123, "enabled": True, "degree": 0, "adverse_direction": -1}
        res = transforms.build_model_settings(
            pybmds.constants.Dtype.CONTINUOUS,
            transforms.PriorEnum.frequentist_restricted,
            options,
            dataset_options,
        )
        assert res.bmr_type is ContinuousRiskType.StandardDeviation
        assert pytest.approx(res.bmr) == 1.5
        assert pytest.approx(res.alpha) == 0.05
        assert pytest.approx(res.tail_prob) == 0.4
        assert res.degree == 0
        assert res.is_increasing is None

    def test_options_dichotomous(self):
        options = {
            "bmr_type": 0,
            "bmr_value": 0.15,
            "confidence_level": 0.95,
        }
        dataset_options = {"dataset_id": 123, "enabled": True, "degree": 1}
        res = transforms.build_model_settings(
            pybmds.constants.Dtype.DICHOTOMOUS,
            transforms.PriorEnum.frequentist_restricted,
            options,
            dataset_options,
        )
        assert res.bmr_type is DichotomousRiskType.AddedRisk
        assert pytest.approx(res.bmr) == 0.15
        assert pytest.approx(res.alpha) == 0.05
        assert res.degree == 1


class TestModels:
    def test_remap_exponential(self):
        assert transforms.remap_exponential([]) == []
        expected = [Models.ExponentialM3, Models.ExponentialM5]
        assert transforms.remap_exponential([Models.Exponential]) == expected
        expected = ["a", Models.ExponentialM3, Models.ExponentialM5, "b"]
        assert transforms.remap_exponential(["a", Models.Exponential, "b"]) == expected
