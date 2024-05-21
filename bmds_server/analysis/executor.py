import itertools
from copy import deepcopy
from typing import NamedTuple, Self

import bmds
from bmds.constants import DistType, ModelClass
from bmds.models.multi_tumor import Multitumor
from bmds.session import Session
from bmds.types.nested_dichotomous import IntralitterCorrelation, LitterSpecificCovariate

from .schema import AnalysisSessionSchema
from .transforms import (
    PriorEnum,
    build_dataset,
    build_model_settings,
    remap_exponential,
)

# excluded continuous models if distribution type is lognormal
lognormal_enabled = {bmds.Models.ExponentialM3, bmds.Models.ExponentialM5}


def build_frequentist_session(dataset, inputs, options, dataset_options) -> Session | None:
    restricted_models = inputs["models"].get(PriorEnum.frequentist_restricted, [])
    unrestricted_models = inputs["models"].get(PriorEnum.frequentist_unrestricted, [])

    # exit early if we have no frequentist models
    if len(restricted_models) + len(unrestricted_models) == 0:
        return None

    dataset_type = inputs["dataset_type"]
    recommendation_settings = inputs.get("recommender", None)
    session = Session(dataset=dataset, recommendation_settings=recommendation_settings)

    for prior_type, model_names in [
        (PriorEnum.frequentist_restricted, remap_exponential(restricted_models)),
        (PriorEnum.frequentist_unrestricted, remap_exponential(unrestricted_models)),
    ]:
        if options.get("dist_type") == DistType.log_normal:
            model_names = [model for model in model_names if model in lognormal_enabled]

        for model_name in model_names:
            model_options = build_model_settings(dataset_type, prior_type, options, dataset_options)
            if model_name in bmds.Models.VARIABLE_POLYNOMIAL():
                min_degree = 2 if model_name in bmds.Models.Polynomial else 1
                max_degree = (
                    model_options.degree + 1
                    if model_options.degree > 0
                    else dataset.num_dose_groups
                )
                degrees = list(range(min_degree, max(min(max_degree, 9), 2)))
                for degree in degrees:
                    model_options = model_options.model_copy()
                    model_options.degree = degree
                    session.add_model(model_name, settings=model_options)
            elif dataset_type == ModelClass.NESTED_DICHOTOMOUS:
                # run all permutations of intralitter correlation and litter specific covariate
                for ilc, lsc_on in itertools.product(IntralitterCorrelation, [True, False]):
                    settings = model_options.model_copy()
                    settings.intralitter_correlation = ilc
                    settings.litter_specific_covariate = (
                        settings.litter_specific_covariate
                        if lsc_on
                        else LitterSpecificCovariate.Unused
                    )
                    session.add_model(model_name, settings=settings)
            else:
                if model_name == bmds.Models.Linear:
                    # a linear model must have a degree of 1
                    model_options.degree = 1
                session.add_model(model_name, settings=model_options)

    return session


def build_bayesian_session(
    dataset: bmds.datasets.base.DatasetBase, inputs: dict, options: dict, dataset_options: dict
) -> Session | None:
    models = inputs["models"].get(PriorEnum.bayesian, [])

    # filter lognormal
    if options.get("dist_type") == DistType.log_normal:
        models = deepcopy(list(filter(lambda d: d["model"] in lognormal_enabled, models)))

    # exit early if we have no bayesian models
    if len(models) == 0:
        return None

    dataset_type = inputs["dataset_type"]
    session = Session(dataset=dataset)
    prior_weights = list(map(lambda d: d["prior_weight"], models))
    for name in map(lambda d: d["model"], models):
        model_options = build_model_settings(
            dataset_type,
            PriorEnum.bayesian,
            options,
            dataset_options,
        )
        if name in bmds.Models.VARIABLE_POLYNOMIAL():
            model_options.degree = 2
        session.add_model(name, settings=model_options)

    session.set_ma_weights(prior_weights)

    return session


class AnalysisSession(NamedTuple):
    """
    This is the execution engine for running analysis in BMDS.

    All database state is decoupled from the execution engine, along with serialization and
    de-serialization methods.  Note that this is a custom Session implementation; the UI of
    the bmds software allows you to effectively run multiple "independent" sessions at once;
    for example, a frequentist model session with a bayesian model averaging session. This
    Session allows construction of these individual bmds sessions into a single analysis
    for presentation in the UI.
    """

    dataset_index: int
    option_index: int
    frequentist: Session | None
    bayesian: Session | None

    @classmethod
    def run(cls, inputs: dict, dataset_index: int, option_index: int) -> AnalysisSessionSchema:
        session = cls.create(inputs, dataset_index, option_index)
        session.execute()
        return session.to_schema()

    @classmethod
    def create(cls, inputs: dict, dataset_index: int, option_index: int) -> Self:
        dataset = build_dataset(inputs["datasets"][dataset_index])
        options = inputs["options"][option_index]
        dataset_options = inputs["dataset_options"][dataset_index]
        return cls(
            dataset_index=dataset_index,
            option_index=option_index,
            frequentist=build_frequentist_session(dataset, inputs, options, dataset_options),
            bayesian=build_bayesian_session(dataset, inputs, options, dataset_options),
        )

    @classmethod
    def deserialize(cls, data: dict) -> Self:
        obj = AnalysisSessionSchema.model_validate(data)
        return cls(
            dataset_index=obj.dataset_index,
            option_index=obj.option_index,
            frequentist=Session.from_serialized(obj.frequentist) if obj.frequentist else None,
            bayesian=Session.from_serialized(obj.bayesian) if obj.bayesian else None,
        )

    def execute(self):
        if self.frequentist:
            self.frequentist.execute()
            if self.frequentist.recommendation_enabled:
                self.frequentist.recommend()

        if self.bayesian:
            if self.bayesian.dataset.dtype == bmds.constants.Dtype.DICHOTOMOUS:
                self.bayesian.add_model_averaging()
            self.bayesian.execute()

    def to_schema(self) -> AnalysisSessionSchema:
        return AnalysisSessionSchema(
            dataset_index=self.dataset_index,
            option_index=self.option_index,
            frequentist=self.frequentist.to_dict() if self.frequentist else None,
            bayesian=self.bayesian.to_dict() if self.bayesian else None,
        )

    def to_dict(self) -> dict:
        return self.to_schema().model_dump(by_alias=True)


class MultiTumorSession(NamedTuple):
    """
    This is the execution engine for running Multitumor modeling in BMDS.
    """

    option_index: int
    session: Multitumor | None

    @classmethod
    def run(cls, inputs: dict, option_index: int) -> AnalysisSessionSchema:
        session = cls.create(inputs, option_index)
        session.execute()
        return session.to_schema()

    @classmethod
    def create(cls, inputs: dict, option_index: int) -> Self:
        datasets = [
            build_dataset(ds)
            for i, ds in enumerate(inputs["datasets"])
            if inputs["dataset_options"][i]["enabled"] is True
        ]
        degrees = [
            option["degree"] for option in inputs["dataset_options"] if option["enabled"] is True
        ]
        dataset_type = inputs["dataset_type"]
        options = inputs["options"][option_index]
        model_settings = build_model_settings(
            dataset_type, PriorEnum.frequentist_restricted, options, {}
        )
        session = Multitumor(datasets, degrees=degrees, model_settings=model_settings)
        return cls(option_index=option_index, session=session)

    def execute(self):
        self.session.execute()

    @classmethod
    def deserialize(cls, data: dict) -> Self:
        obj = AnalysisSessionSchema.model_validate(data)
        return cls(
            option_index=obj.option_index,
            session=Multitumor.from_serialized(obj.frequentist),
        )

    def to_schema(self) -> AnalysisSessionSchema:
        return AnalysisSessionSchema(
            dataset_index=-1, option_index=self.option_index, frequentist=self.session.to_dict()
        )

    def to_dict(self) -> dict:
        return self.to_schema().model_dump(by_alias=True)


AllSession = AnalysisSession | MultiTumorSession


def deserialize(model_class: ModelClass, data: dict) -> AllSession:
    Runner = MultiTumorSession if model_class is ModelClass.MULTI_TUMOR else AnalysisSession
    return Runner.deserialize(data)
