import {observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";

import {checkOrEmpty, getLabel} from "@/common";
import TwoColumnTable from "@/components/common/TwoColumnTable";
import {Dtype} from "@/constants/dataConstants";
import {hasDegrees} from "@/constants/modelConstants";
import {isHybridBmr} from "@/constants/optionsConstants";
import {
    continuousBmrOptions,
    dichotomousBmrOptions,
    distTypeOptions,
    intralitterCorrelation,
    litterSpecificCovariateOptions,
} from "@/constants/optionsConstants";
import {priorClassLabels} from "@/constants/outputConstants";
import {ff} from "@/utils/formatters";

const restrictionMapping = {
    0: ["Model Restriction", "Unrestricted"],
    1: ["Model Restriction", "Restricted"],
    2: ["Model Approach", "Bayesian"],
};

@observer
class ModelOptionsTable extends Component {
    render() {
        const {dtype, model} = this.props,
            priorLabels = model.settings.priors
                ? restrictionMapping[model.settings.priors.prior_class]
                : null,
            priorClass = model.settings.priors
                ? getLabel(model.settings.priors.prior_class, priorClassLabels)
                : null,
            isBayesian = priorClass === "Bayesian";
        let data = [];

        if (dtype == Dtype.DICHOTOMOUS) {
            data = [
                ["BMR Type", getLabel(model.settings.bmr_type, dichotomousBmrOptions)],
                ["BMR", ff(model.settings.bmr)],
                ["Confidence Level (one sided)", ff(1 - model.settings.alpha)],
                hasDegrees.has(model.model_class.verbose)
                    ? ["Degree", ff(model.settings.degree)]
                    : null,
                priorLabels,
                isBayesian ? ["Samples", ff(model.settings.samples)] : null,
                isBayesian ? ["Burn In", ff(model.settings.burnin)] : null,
            ];
        } else if (dtype == Dtype.CONTINUOUS || dtype == Dtype.CONTINUOUS_INDIVIDUAL) {
            data = [
                ["BMR Type", getLabel(model.settings.bmr_type, continuousBmrOptions)],
                ["BMRF", ff(model.settings.bmr)],
                ["Distribution Type", getLabel(model.settings.disttype, distTypeOptions)],
                ["Direction", model.settings.is_increasing ? "Up" : "Down"],
                ["Confidence Level (one sided)", 1 - ff(model.settings.alpha)],
                isHybridBmr(model.settings.bmr_type)
                    ? ["Tail Probability", ff(model.settings.tail_prob)]
                    : null,
                hasDegrees.has(model.model_class.verbose)
                    ? ["Degree", ff(model.settings.degree)]
                    : null,
                priorLabels,
                isBayesian ? ["Samples", model.settings.samples] : null,
                isBayesian ? ["Burn In", model.settings.burnin] : null,
            ];
        } else if (dtype == Dtype.NESTED_DICHOTOMOUS) {
            data = [
                ["BMR Type", getLabel(model.settings.bmr_type, dichotomousBmrOptions)],
                ["BMR", ff(model.settings.bmr)],
                ["Confidence Level (one sided)", ff(1 - model.settings.alpha)],
                [
                    "Litter Specific Covariate",
                    getLabel(
                        model.settings.litter_specific_covariate,
                        litterSpecificCovariateOptions
                    ),
                ],
                [
                    "Intralitter Correlation",
                    getLabel(model.settings.intralitter_correlation, intralitterCorrelation),
                ],
                ["Estimate Background", checkOrEmpty(model.settings.estimate_background)],
                ["Bootstrap Iterations", model.settings.bootstrap_iterations],
                ["Bootstrap Seed", model.settings.bootstrap_seed],
            ];
        } else {
            throw "Unknown dtype";
        }

        return <TwoColumnTable data={data} label="Model Options" />;
    }
}
ModelOptionsTable.propTypes = {
    dtype: PropTypes.string.isRequired,
    model: PropTypes.object.isRequired,
};
export default ModelOptionsTable;
