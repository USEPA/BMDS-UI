from bmds.bmds3.recommender import RecommenderSettings

from ...common.validation import pydantic_validate
from .datasets import validate_datasets
from .models import validate_models
from .options import validate_options
from .selectors import AnalysisSelectedSchema  # noqa: F401
from .session import validate_session


def validate_input(data: dict, partial: bool = False) -> None:
    """
    Validate input payload.

    Args:
        data (dict): the data payload
        partial (bool): validate a partial input

    Raises:
        ValidationError: Raises validation error if any errors found
    """
    # check session
    validate_session(data, partial=partial)
    dataset_type = data["dataset_type"]

    # check dataset schema
    datasets = data.get("datasets")
    dataset_options = data.get("dataset_options")
    if datasets or partial is False:
        validate_datasets(dataset_type, datasets, dataset_options)

    # check model schema
    models = data.get("models")
    if models or partial is False:
        validate_models(dataset_type, models)

    options = data.get("options")
    if options or partial is False:
        validate_options(dataset_type, data.get("options"))

    recommender = data.get("recommender")
    if recommender:
        pydantic_validate(recommender, RecommenderSettings)
