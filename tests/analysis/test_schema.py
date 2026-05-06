import json
from copy import deepcopy

import pytest
from pydantic import ValidationError

from bmds_ui.analysis.schema import (
    AnalysisMigrator,
    PolyKInput,
    RaoScottInput,
    SchemaMigrationException,
)


class TestPolyKInput:
    def test_calculate(self, polyk_dataset):
        analysis = PolyKInput.model_validate(polyk_dataset)
        result = analysis.calculate()
        assert result.adjusted_data.shape == (200, 4)
        assert result.summary.shape == (4, 6)

    def test_validate_dataset(self, polyk_dataset):
        # confirm success
        PolyKInput.model_validate(polyk_dataset)

        # no dataset
        settings = deepcopy(polyk_dataset)
        settings.pop("dataset")
        with pytest.raises(ValidationError, match="Field required"):
            PolyKInput.model_validate(settings)

        # no dataset
        settings = deepcopy(polyk_dataset)
        settings["dataset"] = " "
        with pytest.raises(ValidationError, match="Empty dataset"):
            PolyKInput.model_validate(settings)

        # columns
        settings = deepcopy(polyk_dataset)
        settings["dataset"] = settings["dataset"].replace("dose,day,has_tumor", "dose,day,BAD")
        with pytest.raises(ValidationError, match="Bad column names"):
            PolyKInput.model_validate(settings)

        # check numeric columns
        settings = deepcopy(polyk_dataset)
        settings["dataset"] = settings["dataset"].replace("0,452,0", "0,a,0")
        with pytest.raises(ValidationError, match="must be numeric and finite"):
            PolyKInput.model_validate(settings)

        # check numeric finite columns
        settings = deepcopy(polyk_dataset)
        settings["dataset"] = settings["dataset"].replace("0,452,0", "0,inf,0")
        with pytest.raises(ValidationError, match="must be numeric and finite"):
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


class TestRaoScottInput:
    def test_calculate(self, raoscott_dataset):
        analysis = RaoScottInput.model_validate(raoscott_dataset)
        result = analysis.calculate()
        assert result.df.shape == (7, 9)

    def test_validate_dataset(self, raoscott_dataset):
        # confirm success
        RaoScottInput.model_validate(raoscott_dataset)

        # no dataset
        settings = deepcopy(raoscott_dataset)
        settings.pop("dataset")
        with pytest.raises(ValidationError, match="Field required"):
            RaoScottInput.model_validate(settings)

        # no dataset
        settings = deepcopy(raoscott_dataset)
        settings["dataset"] = " "
        with pytest.raises(ValidationError, match="Empty dataset"):
            RaoScottInput.model_validate(settings)

        # columns
        settings = deepcopy(raoscott_dataset)
        settings["dataset"] = settings["dataset"].replace("dose,n,incidence", "dose,n,BAD")
        with pytest.raises(ValidationError, match="Bad column names"):
            RaoScottInput.model_validate(settings)

        # check numeric columns
        settings = deepcopy(raoscott_dataset)
        settings["dataset"] = settings["dataset"].replace("0,470,11", "0,a,11")
        with pytest.raises(ValidationError, match="must be numeric and finite"):
            RaoScottInput.model_validate(settings)

        # check numeric finite columns
        settings = deepcopy(raoscott_dataset)
        settings["dataset"] = settings["dataset"].replace("0,470,11", "0,inf,11")
        with pytest.raises(ValidationError, match="must be numeric and finite"):
            RaoScottInput.model_validate(settings)

        # columns
        settings = deepcopy(raoscott_dataset)
        settings["dataset"] = settings["dataset"].replace("0,470,11", "-1,470,11")
        with pytest.raises(ValidationError, match="`dose` must be ≥ 0"):
            RaoScottInput.model_validate(settings)

        settings = deepcopy(raoscott_dataset)
        settings["dataset"] = settings["dataset"].replace("7,211,6", "0,211,6")
        with pytest.raises(ValidationError, match="`dose` must be unique"):
            RaoScottInput.model_validate(settings)

        # columns
        settings = deepcopy(raoscott_dataset)
        settings["dataset"] = settings["dataset"].replace("0,470,11", "0,0,11")
        with pytest.raises(ValidationError, match="`n` must be > 0"):
            RaoScottInput.model_validate(settings)

        # columns
        settings = deepcopy(raoscott_dataset)
        settings["dataset"] = settings["dataset"].replace("0,470,11", "0,470,-1")
        with pytest.raises(ValidationError, match="`incidence` must be ≥ 0"):
            RaoScottInput.model_validate(settings)

        # columns
        settings = deepcopy(raoscott_dataset)
        settings["dataset"] = settings["dataset"].replace("0,470,11", "0,10,11")
        with pytest.raises(ValidationError, match="`incidence` must be ≤ `n`"):
            RaoScottInput.model_validate(settings)


class TestSchemaMigrator:
    @pytest.mark.parametrize(
        "data",
        [
            "",
            {},
            {"outputs": None},
            {"outputs": 1},
            {"outputs": {"analysis_schema_version": "test"}},
            [],
            None,
        ],
    )
    def test_invalid_versions(self, data):
        # assert validators are successful
        with pytest.raises(SchemaMigrationException):
            AnalysisMigrator.migrate(data)

    def test_from_1_0(self, data_path):
        # assert migration works and data is mutated
        data = json.loads((data_path / "analyses" / "v1.0.json").read_text())
        migrated = AnalysisMigrator.migrate(data)
        assert migrated.initial["outputs"].get("bmds_ui_version") is None
        assert migrated.analysis.outputs.bmds_ui_version is not None

    def test_from_1_1(self, data_path):
        # assert migration works
        data = json.loads((data_path / "analyses" / "v1.1.json").read_text())
        AnalysisMigrator.migrate(data)
