import pybmds
from pybmds.models.dichotomous import Logistic

dataset = pybmds.DichotomousDataset(
    doses=[0, 50, 100, 150, 200], ns=[100, 100, 100, 100, 100], incidences=[0, 5, 30, 65, 90]
)
model = Logistic(dataset=dataset)
result = model.execute()
print(result.model_dump())  # noqa: T201
