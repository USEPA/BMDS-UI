import itertools
from copy import deepcopy
from typing import NamedTuple, Self
from .utils import fig_to_png_b64
import matplotlib.pyplot as plt 

import pybmds
from pybmds.constants import DistType, ModelClass
from pybmds.session import Session
from pybmds.types.nested_dichotomous import IntralitterCorrelation, LitterSpecificCovariate
from pybmds.plotting.nested_dichotomous import dose_litter_response_plot
from pybmds.plotting.LOUD import get_model_average_figures, _parameter_group_records
from pybmds.models.base import cdf_df

from .schema import AnalysisSessionSchema, StaticPlots
from .transforms import (
    PriorEnum,
    build_dataset,
    build_model_settings
)

# excluded continuous models if distribution type is lognormal
lognormal_enabled = {pybmds.Models.ExponentialM3, pybmds.Models.ExponentialM5}


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
        (PriorEnum.frequentist_restricted, restricted_models),
        (PriorEnum.frequentist_unrestricted, unrestricted_models),
    ]:
        # filter Lognormal. This causes the app to crash if model_names is empty (aka if no lognormal_enabled models were selected)
        if options.get("dist_type") == DistType.log_normal:
            model_names = [model for model in model_names if model in lognormal_enabled]

        for model_name in model_names:
            model_options = build_model_settings(dataset_type=dataset_type, prior_class=prior_type, options=options, dataset_options=dataset_options, model=None, mcmc_options=None)
            if model_name in pybmds.Models.VARIABLE_POLYNOMIAL():
                min_degree = 2 if model_name in pybmds.Models.Polynomial else 1
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
                for lsc, ilc in itertools.product(
                    [LitterSpecificCovariate.Unused, 999],
                    [IntralitterCorrelation.Zero, IntralitterCorrelation.Estimate],
                ):
                    settings = model_options.model_copy()
                    settings.litter_specific_covariate = (
                        settings.litter_specific_covariate if lsc == 999 else lsc
                    )
                    settings.intralitter_correlation = ilc
                    session.add_model(model_name, settings=settings)
            else:
                if model_name == pybmds.Models.Linear:
                    # a linear model must have a degree of 1
                    model_options.degree = 1
                session.add_model(model_name, settings=model_options)

    return session

def build_toxicr_bayesian_session(
    dataset: pybmds.datasets.base.DatasetBase, inputs: dict, options: dict, dataset_options: dict
) -> Session | None:
    models = inputs["models"].get(PriorEnum.toxicr_bayesian, [])

    # filter lognormal
    if options.get("dist_type") == DistType.log_normal:
        models = deepcopy(list(filter(lambda d: d["model"] in lognormal_enabled, models)))     

    # exit early if we have no toxicr bayesian models
    if len(models) == 0:
        return None

    session = Session(dataset=dataset)
    prior_weights = list(map(lambda d: d["prior_weight"], models))

    for model in models:    
        name = model["model"]
        model_options = build_model_settings(
            dataset_type=inputs["dataset_type"],
            prior_class=PriorEnum.toxicr_bayesian,
            options=options,
            dataset_options=dataset_options,
            model=None, 
            mcmc_options=None
        )
        if name in pybmds.Models.VARIABLE_POLYNOMIAL():
            model_options.degree = 2
        session.add_model(name, settings=model_options)    

    session.set_ma_weights(prior_weights)

    return session

def build_loud_bayesian_session(
    dataset: pybmds.datasets.base.DatasetBase, inputs: dict, options: dict, dataset_options: dict, mcmc_options: dict
) -> Session | None:
    models = inputs["models"].get(PriorEnum.loud_bayesian, [])
    # Do Not filter lognormal for continuous loud, since dist_type is not reliant on options set
    # if options.get("dist_type") == DistType.log_normal:
    #     models = deepcopy(list(filter(lambda d: d["model"] in lognormal_enabled, models)))

    # exit early if we have no loud bayesian models
    if len(models) == 0:
        return None

    session = Session(dataset=dataset)
    prior_weights = list(map(lambda d: d["prior_weight"], models))

    for model in models:    
        name = model["model"]
        model_options = build_model_settings(
            dataset_type=inputs["dataset_type"],
            prior_class=PriorEnum.loud_bayesian, # 3
            options=options,
            dataset_options=dataset_options,
            model=model,
            mcmc_options=mcmc_options
        )
        if name in pybmds.Models.VARIABLE_POLYNOMIAL():
            model_options.degree = 2

        session.add_model(name, settings=model_options.model_dump())

    session.set_ma_weights(prior_weights)

    return session


class AnalysisSession(NamedTuple):
    """
    This is the execution engine for running analysis in pybmds.

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
    toxicr_bayesian: Session | None
    loud_bayesian: Session | None

    @classmethod
    def run(cls, inputs: dict, dataset_index: int, option_index: int) -> AnalysisSessionSchema:
        print("DEBUG::: START:::::::: executor.py run()  ... ")
        session = cls.create(inputs, dataset_index, option_index)
        session.execute(inputs)
        print("DEBUG::: DONE:::::::: executor.py run()  ... ")
        return session.to_schema()

    @classmethod
    def create(cls, inputs: dict, dataset_index: int, option_index: int) -> Self:
        dataset = build_dataset(inputs["datasets"][dataset_index])
        options = inputs["options"][option_index]
        dataset_options = inputs["dataset_options"][dataset_index]
        mcmc_options = inputs.get("mcmc_options", {})
        return cls(
            dataset_index=dataset_index,
            option_index=option_index,
            frequentist=build_frequentist_session(dataset, inputs, options, dataset_options),
            toxicr_bayesian=build_toxicr_bayesian_session(dataset, inputs, options, dataset_options),
            loud_bayesian=build_loud_bayesian_session(dataset, inputs, options, dataset_options, mcmc_options)
        )

    @classmethod
    def deserialize(cls, data: dict) -> Self:
        obj = AnalysisSessionSchema.model_validate(data)
        return cls(
            dataset_index=obj.dataset_index,
            option_index=obj.option_index,
            frequentist=Session.from_serialized(obj.frequentist) if obj.frequentist else None,
            toxicr_bayesian=Session.from_serialized(obj.toxicr_bayesian) if obj.toxicr_bayesian else None,
            loud_bayesian=Session.from_serialized(obj.loud_bayesian) if obj.loud_bayesian else None,
        )

    def execute(self, inputs):

        if self.frequentist:
            self.frequentist.execute()
            if self.frequentist.recommendation_enabled:
                self.frequentist.recommend()  

            dataset_type = inputs["dataset_type"]
            if dataset_type == ModelClass.NESTED_DICHOTOMOUS:
                fig = dose_litter_response_plot(self.frequentist)
                # serialize and stash on the session for later retrieval
                try:
                    self.frequentist.nested_dichotomous_plot_png = fig_to_png_b64(fig)
                finally:
                    try:
                        plt.close(fig)
                    except Exception:
                        pass           

        if self.toxicr_bayesian:
            if self.toxicr_bayesian.dataset.dtype == pybmds.constants.Dtype.DICHOTOMOUS:
                self.toxicr_bayesian.add_model_averaging()
            self.toxicr_bayesian.execute()

        if self.loud_bayesian:
            self.loud_bayesian.add_model_averaging()

            print("DEBUG::: execute()  loud_bayesian execute() ... ")
            self.loud_bayesian.execute()

            model_cdf_arrs = []
            for model in self.loud_bayesian.models:
                df = cdf_df(model.results.fit.bmd_dist)
                arr = df[["BMD", "Percentile"]].to_numpy(dtype=float, copy=True).T  
                arr[1] /= 100.0                                          
                model_cdf_arrs.append(arr)
            self.loud_bayesian._model_bmd_dist_cdfs = model_cdf_arrs    
            
            if self.loud_bayesian.model_average:
                df = cdf_df(self.loud_bayesian.model_average.results.bmd_dist)
                ma_arr = df[["BMD", "Percentile"]].to_numpy(dtype=float, copy=True).T
                ma_arr[1] /= 100.0 
                self.loud_bayesian._ma_bmd_dist_cdf = ma_arr

                print("DEBUG::: execute()  figs = get_model_average_figures()  ... ")
                figs = get_model_average_figures(self.loud_bayesian)

                self.loud_bayesian._bmd_summary = figs["bmd_summary"].to_dict()

                self.loud_bayesian._parameter_groups_data = [{
                    "name": group["name"],
                    "columns": list(group["summary"].columns),
                    "rows": group["summary"].fillna("").to_dict(orient="records"),
                } for group in figs["parameter_groups"]]

                self.loud_bayesian.loud_posterior_plot_png = fig_to_png_b64(figs["posterior"])
                self.loud_bayesian.loud_overlay_plot_png = fig_to_png_b64(figs["overlay"])

                print("DEBUG::: execute()  _parameter_group_records()  ... ")
                uncompressed_groups = _parameter_group_records(
                    figs["idata"], self.loud_bayesian, figs["hdi_prob"], compressed=False)
                
                self.loud_bayesian._parameter_trace_pngs = {
                    group["name"]: fig_to_png_b64(group["trace_figure"]) for group in uncompressed_groups
                }
                
                plt.close("all")      


    def to_schema(self) -> AnalysisSessionSchema:
        loud_model_bmd_dist_cdfs = None
        loud_ma_bmd_dist_cdf = None
        if self.loud_bayesian:
            cdfs = getattr(self.loud_bayesian, "_model_bmd_dist_cdfs", None)
            if cdfs is not None:
                loud_model_bmd_dist_cdfs = [arr.tolist() for arr in cdfs]
            ma_cdf = getattr(self.loud_bayesian, "_ma_bmd_dist_cdf", None)
            if ma_cdf is not None:
                loud_ma_bmd_dist_cdf = ma_cdf.tolist()

        static_plots = StaticPlots(
            nested_dichotomous_plot_png=getattr(self.frequentist, "nested_dichotomous_plot_png", None) if self.frequentist else None,
            loud_posterior_plot_png=getattr(self.loud_bayesian, "loud_posterior_plot_png", None) if self.loud_bayesian else None,
            loud_overlay_plot_png=getattr(self.loud_bayesian, "loud_overlay_plot_png", None) if self.loud_bayesian else None,
            loud_parameter_trace_pngs=getattr(self.loud_bayesian, "_parameter_trace_pngs", None) if self.loud_bayesian else None,
        )

        return AnalysisSessionSchema(
            dataset_index=self.dataset_index,
            option_index=self.option_index,
            frequentist=self.frequentist.to_dict() if self.frequentist else None,
            toxicr_bayesian=self.toxicr_bayesian.to_dict() if self.toxicr_bayesian else None,
            loud_bayesian=self.loud_bayesian.to_dict() if self.loud_bayesian else None,
            static_plots=static_plots,
            loud_parameter_groups=getattr(self.loud_bayesian, "_parameter_groups_data", None) if self.loud_bayesian else None,
            bmd_summary=getattr(self.loud_bayesian, "_bmd_summary", None) if self.loud_bayesian else None,
            loud_model_bmd_dist_cdfs=loud_model_bmd_dist_cdfs,
            loud_ma_bmd_dist_cdf=loud_ma_bmd_dist_cdf,
        )

    def to_dict(self) -> dict:
        return self.to_schema().model_dump(by_alias=True)


class MultiTumorSession(NamedTuple):
    """
    This is the execution engine for running Multitumor modeling in pybmds.
    """

    option_index: int
    session: pybmds.Multitumor | None

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
            dataset_type=dataset_type, prior_class=PriorEnum.frequentist_restricted, options=options, dataset_options={}, model=None, mcmc_options=None
        )
        session = pybmds.Multitumor(datasets, degrees=degrees, settings=model_settings)
        return cls(option_index=option_index, session=session)

    def execute(self):
        self.session.execute()

    @classmethod
    def deserialize(cls, data: dict) -> Self:
        obj = AnalysisSessionSchema.model_validate(data)
        return cls(
            option_index=obj.option_index,
            session=pybmds.Multitumor.from_serialized(obj.frequentist),
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
