import json
from copy import deepcopy

import pytest
from pydantic import ValidationError

from bmds_ui.analysis.schema import (
    AnalysisMigrator,
    CochranArmitage,
    JonckheereTerpstraInput,
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


class TestJonckheereTerpstraInput: 
    def test_calculate(self, jonckheereterpstra_dataset_individual): 
        analysis = JonckheereTerpstraInput.model_validate(jonckheereterpstra_dataset_individual) 
        result = analysis.calculate() 
        assert list(result.keys()) == ["Hypothesis", "Statistic", "Approach (P-Value)", "P-Value"] 
        assert result["Hypothesis"] == "increasing" 

    def test_validate_dataset(self, jonckheereterpstra_dataset_individual): 
        # confirm success 
        JonckheereTerpstraInput.model_validate(jonckheereterpstra_dataset_individual) 
        
        # no dataset 
        settings = deepcopy(jonckheereterpstra_dataset_individual) 
        settings.pop("dataset") 
        with pytest.raises(ValidationError, match="Field required"): 
            JonckheereTerpstraInput.model_validate(settings) 
            
        # empty dataset 
        settings = deepcopy(jonckheereterpstra_dataset_individual) 
        settings["dataset"] = " " 
        with pytest.raises(ValidationError, match="Empty dataset"): 
            JonckheereTerpstraInput.model_validate(settings) 
            
        # bad column names 
        settings = deepcopy(jonckheereterpstra_dataset_individual)
        settings["dataset"] = settings["dataset"].replace("doses,responses", "doses,BAD") 
        with pytest.raises(ValidationError, match="Bad column names"): 
            JonckheereTerpstraInput.model_validate(settings) 
            
        # non-numeric data 
        settings = deepcopy(jonckheereterpstra_dataset_individual) 
        settings["dataset"] = settings["dataset"].replace("0,8.1079", "0,a") 
        with pytest.raises(ValidationError, match="must be numeric and finite"): 
            JonckheereTerpstraInput.model_validate(settings) 
            
        # non-finite data 
        settings = deepcopy(jonckheereterpstra_dataset_individual) 
        settings["dataset"] = settings["dataset"].replace("0,8.1079", "0,inf") 
        with pytest.raises(ValidationError, match="must be numeric and finite"): 
            JonckheereTerpstraInput.model_validate(settings) 
            
        # negative doses 
        settings = deepcopy(jonckheereterpstra_dataset_individual) 
        settings["dataset"] = settings["dataset"].replace("0,8.1079", "-1,8.1079") 
        with pytest.raises(ValidationError, match="`doses` must be ≥ 0"): 
            JonckheereTerpstraInput.model_validate(settings) 
            
        # invalid model_type 
        settings = deepcopy(jonckheereterpstra_dataset_individual) 
        settings["model_type"] = "BAD" 
        with pytest.raises(ValidationError, match="Unknown model_type"): 
            JonckheereTerpstraInput.model_validate(settings) 
            
    def test_validate_dataset_cs(self, jonckheereterpstra_dataset_continuous_summary): 
        """Test CS (continuous summary) model_type specific validations.""" 
        
        # confirm success 
        JonckheereTerpstraInput.model_validate(jonckheereterpstra_dataset_continuous_summary) 
        
        # ns must be > 0 
        settings = deepcopy(jonckheereterpstra_dataset_continuous_summary) 
        settings["dataset"] = settings["dataset"].replace("0,10,5.0,1.0", "0,0,5.0,1.0") 
        with pytest.raises(ValidationError, match="`ns` must be > 0"): 
            JonckheereTerpstraInput.model_validate(settings) 
        
        # stdevs must be >= 0 
        settings = deepcopy(jonckheereterpstra_dataset_continuous_summary) 
        settings["dataset"] = settings["dataset"].replace("0,10,5.0,1.0", "0,10,5.0,-1.0") 
        with pytest.raises(ValidationError, match="`stdevs` must be ≥ 0"): 
            JonckheereTerpstraInput.model_validate(settings) 
            
        # CS model_type requires CS columns 
        settings = deepcopy(jonckheereterpstra_dataset_continuous_summary) 
        settings["dataset"] = settings["dataset"].replace( "doses,ns,means,stdevs", "doses,responses" ) 
        with pytest.raises(ValidationError, match="Bad column names"): 
            JonckheereTerpstraInput.model_validate(settings) 
            
        
class TestCochranArmitage: 
    def test_calculate(self, cochranarmitage_dataset): 
        analysis = CochranArmitage.model_validate(cochranarmitage_dataset) 
        result = analysis.calculate() 
        assert list(result.keys()) == [ "Statistic", "P-Value (Asymptotic)", "P-Value (Exact) "]
        
    def test_validate_dataset(self, cochranarmitage_dataset): 
        # confirm success 
        CochranArmitage.model_validate(cochranarmitage_dataset) 
        
        # no dataset 
        settings = deepcopy(cochranarmitage_dataset) 
        settings.pop("dataset") 
        with pytest.raises(ValidationError, match="Field required"): 
            CochranArmitage.model_validate(settings) 
            
        # empty dataset 
        settings = deepcopy(cochranarmitage_dataset) 
        settings["dataset"] = " " 
        with pytest.raises(ValidationError, match="Empty dataset"): 
            CochranArmitage.model_validate(settings) 
            
        # bad column names 
        settings = deepcopy(cochranarmitage_dataset)
        settings["dataset"]= "doses,ns,BAD\n0,20,0\n10,20,0\n50,20,1\n150,20,4\n400,20,11",
        with pytest.raises(ValidationError, match="Bad column names"): 
            CochranArmitage.model_validate(settings) 
            
        # non-numeric data 
        settings = deepcopy(cochranarmitage_dataset)
        settings["dataset"] = settings["dataset"].replace("0,20,0", "0,a,0") 
        with pytest.raises(ValidationError, match="must be numeric and finite"): 
            CochranArmitage.model_validate(settings) 
            
        # non-finite data 
        settings = deepcopy(cochranarmitage_dataset) 
        settings["dataset"] = settings["dataset"].replace("0,20,0", "0,inf,0") 
        with pytest.raises(ValidationError, match="must be numeric and finite"): 
            CochranArmitage.model_validate(settings) 
            
        # negative doses 
        settings = deepcopy(cochranarmitage_dataset) 
        settings["dataset"] = settings["dataset"].replace("0,20,0", "-1,20,0") 
        with pytest.raises(ValidationError, match="`doses` must be ≥ 0"): 
            CochranArmitage.model_validate(settings) 
            
        # duplicate doses 
        settings = deepcopy(cochranarmitage_dataset) 
        settings["dataset"] = settings["dataset"].replace("10,20,0", "0,20,0") 
        with pytest.raises(ValidationError, match="`dose` must be unique"): 
            CochranArmitage.model_validate(settings) 
            
        # ns must be > 0 
        settings = deepcopy(cochranarmitage_dataset) 
        settings["dataset"] = settings["dataset"].replace("0,20,0", "0,0,0") 
        with pytest.raises(ValidationError, match="`n` must be > 0"): 
            CochranArmitage.model_validate(settings) 
            
        # incidences must be >= 0 
        settings = deepcopy(cochranarmitage_dataset) 
        settings["dataset"] = settings["dataset"].replace("0,20,0", "0,20,-1") 
        with pytest.raises(ValidationError, match="`incidence` must be ≥ 0"): 
            CochranArmitage.model_validate(settings) 
            
        # incidence must be <= n 
        settings = deepcopy(cochranarmitage_dataset)
        settings["dataset"] = settings["dataset"].replace("0,20,0", "0,5,10") 
        with pytest.raises(ValidationError, match="`incidence` must be ≤ `n`"): 
            CochranArmitage.model_validate(settings)


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
