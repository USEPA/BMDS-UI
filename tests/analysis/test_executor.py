from copy import deepcopy

from bmds.bmds3.constants import ContinuousModelIds, DichotomousModelIds
from bmds.bmds3.types.priors import PriorClass

from bmds_server.analysis.executor import AnalysisSession


class TestAnalysisSession:
    def test_default_dichotomous(self, bmds3_complete_dichotomous):
        # assure a default dataset can be created
        data = deepcopy(bmds3_complete_dichotomous)
        session = AnalysisSession.create(data, 0, 0)
        assert len(session.frequentist.models) == 1
        assert len(session.bayesian.models) == 1

    def test_default_continuous(self, bmds3_complete_continuous):
        # assure a default dataset can be created
        data = deepcopy(bmds3_complete_continuous)
        session = AnalysisSession.create(data, 0, 0)
        assert len(session.frequentist.models) == 1
        assert len(session.bayesian.models) == 1

    def test_default_continuous_individual(self, bmds3_complete_continuous_individual):
        # assure a default dataset can be created
        data = deepcopy(bmds3_complete_continuous_individual)
        session = AnalysisSession.create(data, 0, 0)
        assert len(session.frequentist.models) == 1
        assert len(session.bayesian.models) == 1

    def test_prior_classes(self, bmds3_complete_dichotomous):
        # assure a default dataset can be created
        data = deepcopy(bmds3_complete_dichotomous)
        data["models"] = {
            "frequentist_restricted": ["Gamma"],
            "frequentist_unrestricted": ["Gamma"],
            "bayesian": [{"model": "Gamma", "prior_weight": 1}],
        }
        session = AnalysisSession.create(data, 0, 0)
        assert len(session.frequentist.models) == 2
        assert len(session.bayesian.models) == 1

        assert (
            session.frequentist.models[0].settings.priors.prior_class
            is PriorClass.frequentist_restricted
        )
        assert (
            session.frequentist.models[1].settings.priors.prior_class
            is PriorClass.frequentist_unrestricted
        )
        assert session.bayesian.models[0].settings.priors.prior_class is PriorClass.bayesian

    def test_exponential_unpacking(self, bmds3_complete_continuous):
        data = deepcopy(bmds3_complete_continuous)
        data["models"] = {
            "frequentist_restricted": ["Exponential"],
            "bayesian": [{"model": "Exponential", "prior_weight": 1}],
        }
        session = AnalysisSession.create(data, 0, 0)
        assert len(session.frequentist.models) == 2
        assert session.frequentist.models[0].bmd_model_class.id == ContinuousModelIds.c_exp_m3
        assert session.frequentist.models[1].bmd_model_class.id == ContinuousModelIds.c_exp_m5
        assert len(session.bayesian.models) == 2
        assert session.bayesian.models[0].bmd_model_class.id == ContinuousModelIds.c_exp_m3
        assert session.bayesian.models[1].bmd_model_class.id == ContinuousModelIds.c_exp_m5

    def test_multistage_permutations(self, bmds3_complete_dichotomous):
        def _expected_degree(session, n: int):
            assert session.bayesian is None
            assert len(session.frequentist.models) == n
            model_classes = set([model.bmd_model_class.id for model in session.frequentist.models])
            assert model_classes == {DichotomousModelIds.d_multistage}
            degrees = set([model.settings.degree for model in session.frequentist.models])
            assert degrees == set(list(range(1, n + 1)))

        # degree = 1
        data = deepcopy(bmds3_complete_dichotomous)
        data["models"] = {"frequentist_restricted": ["Multistage"]}
        data["dataset_options"][0]["degree"] = 1
        session = AnalysisSession.create(data, 0, 0)
        _expected_degree(session, 1)

        # degree = 2
        data = deepcopy(bmds3_complete_dichotomous)
        data["models"] = {"frequentist_restricted": ["Multistage"]}
        data["dataset_options"][0]["degree"] = 2
        session = AnalysisSession.create(data, 0, 0)
        _expected_degree(session, 2)

        # 3 dose-groups; degree = N-1; expected 2
        for num_doses in range(3, 8):
            expected_degree = min(max(num_doses - 1, 2), 8)
            data = deepcopy(bmds3_complete_dichotomous)
            data["datasets"] = [
                {
                    "dtype": "D",
                    "metadata": {"id": 123},
                    "doses": list(range(num_doses)),
                    "ns": [10] * num_doses,
                    "incidences": list(range(1, num_doses + 1)),
                }
            ]
            assert len(data["datasets"][0]["doses"]) == num_doses
            data["models"] = {"frequentist_restricted": ["Multistage"]}
            data["dataset_options"][0]["degree"] = 0  # n-1
            session = AnalysisSession.create(data, 0, 0)
            _expected_degree(session, expected_degree)

        # degree = N -1, bayesian, fixed at degree == 2
        data = deepcopy(bmds3_complete_dichotomous)
        data["models"] = {"bayesian": [{"model": "Multistage", "prior_weight": 1}]}
        data["dataset_options"][0]["degree"] = 0
        session = AnalysisSession.create(data, 0, 0)
        assert session.frequentist is None
        assert len(session.bayesian.models) == 1
        model = session.bayesian.models[0]
        assert model.bmd_model_class.id == DichotomousModelIds.d_multistage
        assert model.settings.degree == 2

    def test_polynomial_unpacking(self, bmds3_complete_continuous):
        # test linear; degree 0
        data = deepcopy(bmds3_complete_continuous)
        data["models"] = {"frequentist_unrestricted": ["Linear"]}
        data["dataset_options"][0]["degree"] = 0
        session = AnalysisSession.create(data, 0, 0)
        assert len(session.frequentist.models) == 1
        assert session.frequentist.models[0].settings.degree == 1
        assert session.bayesian is None

        # test polynomial; degree 2
        data = deepcopy(bmds3_complete_continuous)
        data["models"] = {"frequentist_unrestricted": ["Polynomial"]}
        data["dataset_options"][0]["degree"] = 2
        session = AnalysisSession.create(data, 0, 0)
        assert len(session.frequentist.models) == 1
        assert session.frequentist.models[0].settings.degree == 2
        assert session.bayesian is None

        # test polynomial; degree 3
        data = deepcopy(bmds3_complete_continuous)
        data["models"] = {"frequentist_unrestricted": ["Polynomial"]}
        data["dataset_options"][0]["degree"] = 3
        session = AnalysisSession.create(data, 0, 0)
        assert len(session.frequentist.models) == 2
        assert session.frequentist.models[0].settings.degree == 2
        assert session.frequentist.models[1].settings.degree == 3
        assert session.bayesian is None

        # test linear + polynomial; degree 3
        data = deepcopy(bmds3_complete_continuous)
        data["models"] = {"frequentist_unrestricted": ["Linear", "Polynomial"]}
        data["dataset_options"][0]["degree"] = 3
        session = AnalysisSession.create(data, 0, 0)
        assert len(session.frequentist.models) == 3
        assert session.frequentist.models[0].settings.degree == 1
        assert session.frequentist.models[1].settings.degree == 2
        assert session.frequentist.models[2].settings.degree == 3
        assert session.bayesian is None

    # disttype 3 Linear and power are not added
    def test_disttype(self, bmds3_complete_continuous):
        data = deepcopy(bmds3_complete_continuous)
        data["models"] = {
            "frequentist_restricted": ["Exponential", "Hill", "Linear", "Power"],
        }

        # normal
        data["options"][0]["dist_type"] = 1
        session = AnalysisSession.create(data, 0, 0)
        assert len(session.frequentist.models) == 5
        names = [model.name() for model in session.frequentist.models]
        assert names == ["Exponential 3", "Exponential 5", "Hill", "Linear", "Power"]

        data["options"][0]["dist_type"] = 2
        session = AnalysisSession.create(data, 0, 0)
        assert len(session.frequentist.models) == 5
        names = [model.name() for model in session.frequentist.models]
        assert names == ["Exponential 3", "Exponential 5", "Hill", "Linear", "Power"]

        # lognormal
        data["options"][0]["dist_type"] = 3
        session = AnalysisSession.create(data, 0, 0)
        assert len(session.frequentist.models) == 2
        names = [model.name() for model in session.frequentist.models]
        assert names == ["Exponential 3", "Exponential 5"]
