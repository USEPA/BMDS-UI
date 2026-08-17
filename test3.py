import pybmds
from pybmds.types.continuous import ContinuousRiskType

dataset = pybmds.ContinuousDataset(
doses=[0, 50, 100, 200, 400],
ns=[20, 20, 20, 20, 20],
means=[5.26, 5.76, 6.13, 8.24, 9.23],
stdevs=[2.23, 1.47, 2.47, 2.24, 1.56],
)
from datetime import datetime

print(datetime.now())

session = pybmds.Session(dataset=dataset)
session.add_default_bayesian_models(
include_extended=True,
weight_option=1,
settings=dict(
n_chains=4,
samples=12500, # iterations per chain
burnin=1500,
seed=0,
bmr_type=ContinuousRiskType.StandardDeviation,
bmr=1,
),
)
session.execute()
print(datetime.now())

report = session.to_docx(
session_inputs_table=True,
parameter_visualizations=True,
compressed=False,
bmd_cdf_table=True,
all_models=True,
)
print(datetime.now())
print("done")
report.save("MARY_TEST_report.docx")