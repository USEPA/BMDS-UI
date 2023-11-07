from copy import deepcopy

import pytest
from pydantic import ValidationError

from bmds_server.analysis.schema import PolyKInput


class TestPolyKInput:
    def test_calculate(self, polyk_dataset):
        analysis = PolyKInput.model_validate(polyk_dataset)
        df1, df2 = analysis.calculate()
        assert df1.shape == (200, 4)
        assert df2.shape == (4, 6)

    def test_validate_dataset(self, polyk_dataset):
        # confirm success
        PolyKInput.model_validate(polyk_dataset)

        # no dataset
        settings = deepcopy(polyk_dataset)
        settings.pop("dataset")
        with pytest.raises(ValidationError, match="Field required"):
            PolyKInput.model_validate(settings)

        # columns
        settings = deepcopy(polyk_dataset)
        settings["dataset"] = settings["dataset"].replace("dose,day,has_tumor", "dose,day,BAD")
        with pytest.raises(ValidationError, match="Bad column names"):
            PolyKInput.model_validate(settings)

        # columns
        settings = deepcopy(polyk_dataset)
        settings["dataset"] = settings["dataset"].replace("0,452,0", "-1,452,0")
        with pytest.raises(ValidationError, match="`doses` must be ≥ 0"):
            PolyKInput.model_validate(settings)

        # columns
        settings = deepcopy(polyk_dataset)
        settings["dataset"] = settings["dataset"].replace("0,452,0", "0,-1,0")
        with pytest.raises(ValidationError, match="`day` must be ≥ 0"):
            PolyKInput.model_validate(settings)

        # columns
        settings = deepcopy(polyk_dataset)
        settings["dataset"] = settings["dataset"].replace("0,452,0", "0,452,3")
        with pytest.raises(
            ValidationError, match="`has_tumor` must include only the values {0, 1}"
        ):
            PolyKInput.model_validate(settings)
