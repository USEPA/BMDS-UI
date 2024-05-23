from pydantic import BaseModel

from pybmds.selected import SelectedModelSchema


class AnalysisSelectedSchema(BaseModel):
    # a session-specific selection dataset instance
    option_index: int
    dataset_index: int
    selected: SelectedModelSchema
