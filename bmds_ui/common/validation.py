from typing import Any, TypeVar

from django.core.exceptions import ValidationError
from pydantic import BaseModel
from pydantic import ValidationError as PydanticValidationError

T = TypeVar("T", bound=BaseModel)


def pydantic_validate(data: Any, model: type[T]) -> T:
    """Attempt to validate incoming data using Pydantic model class.

    Args:
        data (Any): Incoming data
        model (BaseModel): Pydantic model

    Raises:
        ValidationError: A django validation error parsing fails

    Returns:
        BaseModel: Instance of class, if successful.
    """
    try:
        return model.model_validate(data)
    except PydanticValidationError as err:
        raise ValidationError(err.json())
