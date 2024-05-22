from pybmds.selected import SelectedModelSchema
from pydantic import BaseModel


class AnalysisSelectedSchema(BaseModel):
    # a session-specific selection dataset instance
    option_index: int
    dataset_index: int
    selected: SelectedModelSchema
