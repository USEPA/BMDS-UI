from pathlib import Path

import pytest
from bmds.recommender import RecommenderSettings
from django.core.management import call_command


@pytest.fixture(scope="session")
def data_path():
    return Path(__file__).parent.absolute() / "data"


@pytest.fixture(scope="session")
def rewrite_data_files():
    """
    If you're making changes to datasets and it's expected that previously saved data will need to
    be written, then you can set this flag to True and then all saved data will be rewritten.

    Please review changes to ensure they're expected after modifying this flag.

    A test exists in CI to ensure that this flag is set to False on commit.
    """
    return False


@pytest.fixture(scope="session", autouse=True)
def test_db(django_db_setup, django_db_blocker):
    with django_db_blocker.unblock():
        call_command("load_test_db")


@pytest.fixture(scope="session")
def vcr_config():
    return {
        "filter_headers": [("authorization", "<omitted>")],
    }


@pytest.fixture(scope="module")
def vcr_cassette_dir(request):
    cassette_dir = Path(__file__).parent.absolute() / "cassettes" / request.module.__name__
    return str(cassette_dir)


@pytest.fixture
def bmds3_complete_continuous():
    return {
        "bmds_version": "BMDS330",
        "dataset_type": "C",
        "models": {
            "frequentist_restricted": ["Power"],
            "bayesian": [{"model": "Power", "prior_weight": 1}],
        },
        "datasets": [
            {
                "dtype": "C",
                "metadata": {"id": 123},
                "doses": [0, 50, 100, 150, 200],
                "ns": [100, 100, 100, 100, 100],
                "means": [10, 20, 30, 40, 50],
                "stdevs": [3, 4, 5, 6, 7],
            }
        ],
        "options": [
            {
                "bmr_type": 2,
                "bmr_value": 1.0,
                "tail_probability": 0.95,
                "confidence_level": 0.95,
                "dist_type": 1,
            }
        ],
        "dataset_options": [
            {"dataset_id": 123, "enabled": True, "degree": 0, "adverse_direction": -1}
        ],
        "recommender": RecommenderSettings.build_default().model_dump(),
    }


@pytest.fixture
def bmds3_complete_continuous_individual():
    # fmt: off
    return {
        "bmds_version": "BMDS330",
        "dataset_type": "C",
        "models": {
            "frequentist_restricted": ["Power"],
            "bayesian": [{"model": "Power", "prior_weight": 1}],
        },
        "datasets": [
            {
                "dtype": "CI",
                "metadata": {"id": 123},
                "doses": [
                    0, 0, 0, 0, 0, 0, 0, 0,
                    0.1, 0.1, 0.1, 0.1, 0.1, 0.1,
                    1, 1, 1, 1, 1, 1,
                    10, 10, 10, 10, 10, 10,
                    100, 100, 100, 100, 100, 100,
                    300, 300, 300, 300, 300, 300,
                    500, 500, 500, 500, 500, 500,
                ],
                "responses": [
                    8.1079, 9.3063, 9.7431, 9.7814, 10.0517, 10.6132, 10.7509, 11.0567,
                    9.1556, 9.6821, 9.8256, 10.2095, 10.2222, 12.0382,
                    9.5661, 9.7059, 9.9905, 10.2716, 10.471, 11.0602,
                    8.8514, 10.0107, 10.0854, 10.5683, 11.1394, 11.4875,
                    9.5427, 9.7211, 9.8267, 10.0231, 10.1833, 10.8685,
                    10.368, 10.5176, 11.3168, 12.002, 12.1186, 12.6368,
                    9.9572, 10.1347, 10.7743, 11.0571, 11.1564, 12.0368,
                ],
            }
        ],
        "options": [
            {
                "bmr_type": 2,
                "bmr_value": 1.0,
                "tail_probability": 0.95,
                "confidence_level": 0.95,
                "dist_type": 1,
            }
        ],
        "dataset_options": [
            {"dataset_id": 123, "enabled": True, "degree": 0, "adverse_direction": -1}
        ],
        "recommender": RecommenderSettings.build_default().model_dump(),
    }
    # fmt: on


@pytest.fixture
def bmds3_complete_dichotomous():
    return {
        "bmds_version": "BMDS330",
        "dataset_type": "D",
        "models": {
            "frequentist_unrestricted": ["Logistic"],
            "bayesian": [{"model": "Logistic", "prior_weight": 1}],
        },
        "datasets": [
            {
                "dtype": "D",
                "metadata": {"id": 123},
                "doses": [0, 10, 50, 150, 400],
                "ns": [20, 20, 20, 20, 20],
                "incidences": [0, 0, 1, 4, 11],
            }
        ],
        "options": [{"bmr_type": 1, "bmr_value": 0.1, "confidence_level": 0.95}],
        "dataset_options": [{"dataset_id": 123, "enabled": True, "degree": 0}],
        "recommender": RecommenderSettings.build_default().model_dump(),
    }


@pytest.fixture
def nested_dichotomous_datasets():
    # fmt: off
    return [
        {
            "dtype": "ND",
            "metadata": {"id": 123},
            "doses": [
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                25, 25, 25, 25, 25, 25, 25, 25, 25,
                50, 50, 50, 50, 50, 50, 50, 50, 50,
            ],
            "litter_ns":[
                16, 9, 15, 14, 13, 9, 10, 14, 10, 11, 14,
                9, 14, 9, 13, 12, 10, 10, 11, 14,
                11, 11, 14, 11, 10, 11, 10, 15, 7,
            ],
            "incidences":[
                1, 1, 2, 3, 3, 0, 2, 2, 1, 2, 4,
                5, 6, 2, 6, 3, 1, 2, 4, 3,
                4, 5, 5, 4, 5, 4, 5, 6, 2,
            ],
            "litter_covariates": [
                16, 9, 15, 14, 13, 9, 10, 14, 10, 11, 14,
                9, 14, 9, 13, 12, 10, 10, 11, 14,
                11, 11, 14, 11, 10, 11, 10, 15, 7,
            ],
        }
    ]
    # fmt: on


# fmt:off
@pytest.fixture
def bmds_complete_nd():
    return {
        "bmds_version": "BMDS330",
        "dataset_type": "ND",
        "models": {
            "frequentist_restricted": ["Nested Logistic"],
            "frequentist_unrestricted": []
        },
        "options": [
            {
                "bmr_type": 1,
                "bmr_value": 0.1,
                "bootstrap_seed": 0,
                "confidence_level": 0.95,
                "bootstrap_iterations": 1000,
                "litter_specific_covariate": 1
            }
        ],
        "datasets": [
            {
                "doses": [
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    25, 25, 25, 25, 25, 25, 25, 25, 25,
                    50, 50, 50, 50, 50, 50,
                    75, 75, 75,
                ],
                "dtype": "ND",
                "metadata": {
                    "id": 0,
                    "name": "Dataset #1",
                    "dose_name": "Dose",
                    "dose_units": "",
                    "response_name": "Incidence",
                    "response_units": ""
                },
                "litter_ns": [
                    16, 9, 15, 14, 13, 9, 10, 14, 10, 11, 14,
                    9, 14, 9, 13, 12, 10, 10, 11, 14,
                    11, 11, 14, 11, 10, 11,
                    10, 15, 7,
                ],
                "incidences": [
                    1, 1, 2, 3, 3, 0, 2, 2, 1, 2, 4,
                    5, 6, 2, 6, 3, 1, 2, 4, 3,
                    4, 5, 5, 4, 5, 4,
                    5, 6, 2,
                ],
                "litter_covariates": [
                    16, 9, 15, 14, 13, 9, 10, 14, 10, 11, 14,
                    9, 14, 9, 13, 12, 10, 10, 11, 14,
                    11, 11, 14, 11, 10, 11,
                    10, 15, 7,
                ]
            }
        ],
        "dataset_options": [
            {"enabled": True, "dataset_id": 0},
        ],
        "recommender": RecommenderSettings.build_default().model_dump(),
    }
    #fmt: on


# fmt:off
@pytest.fixture
def bmds_complete_mt():
    return {
        "bmds_version": "BMDS330",
        "dataset_type": "MT",
        "models": {
            "frequentist_restricted": ["Multistage"],
            "frequentist_unrestricted": []
        },
        "options": [
            {
                "bmr_type": 1,
                "bmr_value": 0.1,
                "confidence_level": 0.95
            }
        ],
        "datasets": [
            {
                "dtype": "D",
                "doses": [0, 50, 100, 200, 400],
                "ns": [20, 20, 20, 20, 20],
                "incidences": [0, 1, 2, 10, 19],
                "metadata": {
                    "id": 0,
                    "name": "Dataset #1",
                    "dose_name": "Dose",
                    "dose_units": "",
                    "response_name": "Incidence",
                    "response_units": ""
                },
            },
            {
                "dtype": "D",
                "doses": [0, 50, 100, 200, 400],
                "ns": [20, 20, 20, 20, 20],
                "incidences": [0, 1, 2, 4, 11],
                "metadata": {
                    "id": 1,
                    "name": "Dataset #2",
                    "dose_name": "Dose",
                    "dose_units": "",
                    "response_name": "Incidence",
                    "response_units": ""
                },
            },
            {
                "dtype": "D",
                "doses": [0, 50, 100, 200, 400],
                "ns": [20, 20, 20, 20, 20],
                "incidences": [0, 2, 2, 6, 9],
                "metadata": {
                    "id": 2,
                    "name": "Dataset #3",
                    "dose_name": "Dose",
                    "dose_units": "",
                    "response_name": "Incidence",
                    "response_units": ""
                },
            },
        ],
        "dataset_options": [
            {"enabled": True, "dataset_id": 0, "degree": 3},
            {"enabled": True, "dataset_id": 1, "degree": 0},
            {"enabled": True, "dataset_id": 2, "degree": 0},
        ],
        "recommender": RecommenderSettings.build_default().model_dump(by_alias=True),
    }
    #fmt: on


@pytest.fixture
def polyk_dataset() -> dict:
    return {
        "dataset": "dose,day,has_tumor\n0,452,0\n0,535,0\n0,553,0\n0,570,0\n0,596,0\n0,603,0\n0,606,0\n0,607,0\n0,627,0\n0,628,0\n0,635,0\n0,635,0\n0,638,0\n0,664,0\n0,666,0\n0,674,0\n0,680,0\n0,684,0\n0,684,0\n0,719,0\n0,722,0\n0,729,0\n0,729,1\n0,733,1\n0,733,0\n0,733,0\n0,733,0\n0,733,0\n0,733,0\n0,733,0\n0,733,0\n0,733,0\n0,733,1\n0,733,0\n0,733,0\n0,733,0\n0,733,0\n0,733,0\n0,733,0\n0,733,0\n0,734,0\n0,734,0\n0,734,0\n0,734,0\n0,734,1\n0,734,0\n0,734,0\n0,734,0\n0,734,1\n0,734,1\n12.8,439,0\n12.8,523,0\n12.8,530,0\n12.8,546,0\n12.8,579,0\n12.8,582,0\n12.8,583,0\n12.8,596,0\n12.8,607,0\n12.8,614,0\n12.8,626,0\n12.8,635,0\n12.8,635,0\n12.8,638,1\n12.8,659,0\n12.8,667,0\n12.8,680,1\n12.8,688,0\n12.8,691,1\n12.8,691,0\n12.8,701,0\n12.8,708,0\n12.8,722,1\n12.8,733,0\n12.8,733,0\n12.8,733,1\n12.8,733,1\n12.8,733,0\n12.8,733,0\n12.8,733,0\n12.8,733,0\n12.8,733,0\n12.8,733,0\n12.8,733,1\n12.8,733,0\n12.8,733,0\n12.8,733,1\n12.8,733,1\n12.8,733,1\n12.8,733,0\n12.8,733,0\n12.8,733,0\n12.8,734,0\n12.8,734,1\n12.8,734,0\n12.8,734,0\n12.8,734,1\n12.8,734,0\n12.8,734,0\n12.8,734,0\n32,382,0\n32,439,0\n32,470,0\n32,491,0\n32,495,0\n32,502,0\n32,545,0\n32,551,0\n32,565,0\n32,567,1\n32,579,1\n32,596,1\n32,602,0\n32,606,1\n32,607,1\n32,607,0\n32,607,1\n32,620,1\n32,623,0\n32,629,0\n32,635,0\n32,649,0\n32,663,0\n32,666,0\n32,666,1\n32,679,1\n32,679,0\n32,680,1\n32,688,1\n32,688,0\n32,693,0\n32,701,1\n32,705,0\n32,713,1\n32,715,1\n32,717,1\n32,733,0\n32,733,1\n32,733,0\n32,733,1\n32,734,0\n32,734,1\n32,734,0\n32,734,0\n32,734,1\n32,734,1\n32,734,0\n32,734,1\n32,734,1\n32,734,1\n80,392,0\n80,422,0\n80,454,0\n80,523,0\n80,524,1\n80,567,1\n80,579,0\n80,587,1\n80,589,1\n80,595,0\n80,600,0\n80,603,0\n80,608,1\n80,620,1\n80,624,0\n80,624,1\n80,628,0\n80,635,0\n80,635,0\n80,637,0\n80,644,1\n80,644,0\n80,649,1\n80,649,1\n80,649,1\n80,656,1\n80,657,1\n80,659,1\n80,659,1\n80,663,0\n80,672,1\n80,677,1\n80,677,1\n80,680,0\n80,687,0\n80,701,0\n80,701,1\n80,733,1\n80,733,1\n80,733,1\n80,733,0\n80,733,1\n80,733,0\n80,733,1\n80,733,1\n80,733,1\n80,733,1\n80,733,1\n80,734,0\n80,734,0",
        "dose_units": "mg/kg/d",
        "power": 3,
        "duration": None,
    }
