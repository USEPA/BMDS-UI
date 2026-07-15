import {inject, observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";

import TwoColumnTable from "@/components/common/TwoColumnTable";
import * as mc from "@/constants/mainConstants";
import {modelClasses} from "@/constants/outputConstants";
import {ff, fractionalFormatter} from "@/utils/formatters";

@inject("outputStore")
@observer
class Summary extends Component {
    render() {
        const {outputStore} = this.props,
            model = outputStore.modalModel,
            modelClass = outputStore.modalModelClass,
            {results} = model;

        const data = [
            ["BMD", ff(results.bmd), results.bmd],
            ["BMDL", ff(results.bmdl), results.bmdl],
            ["BMDU", ff(results.bmdu), results.bmdu],
        ];

        // LOUD Bayesian modeling summary table is identical for both Continuous and Dichotomous datasets
        if (modelClass === modelClasses.loud_bayesian) {
            data.push(
                ["WAIC", ff(results.summary_waic), results.summary_waic],
                [
                    <span key={0}>
                        <i>P</i>-value
                    </span>,
                    fractionalFormatter(results.summary_p_value),
                    results.summary_p_value,
                ],
                ["Log-Likelihood", ff(results.fit.loglikelihood), results.fit.loglikelihood]
            );
        } else if (outputStore.isNestedDichotomous) {
            data.push(
                ["AIC", ff(results.aic), results.aic],
                [
                    <span key={0}>
                        <i>P</i>-value
                    </span>,
                    fractionalFormatter(results.combined_pvalue),
                    results.combined_pvalue,
                ],
                ["Model d.f.", ff(results.dof), results.dof],
                [<span key={1}>Chi²</span>, ff(results.chi_squared), results.chi_squared]
            );
        } else if (outputStore.getModelType === mc.MODEL_CONTINUOUS) {
            data.push(
                ["AIC", ff(results.fit.aic), results.fit.aic],
                [
                    <span key={0}>
                        <i>P</i>-value
                    </span>,
                    fractionalFormatter(results.tests.p_values[3]),
                    results.tests.p_values[3],
                ],
                ["Model d.f.", ff(results.tests.dfs[3]), results.tests.dfs[3]],
                ["Log-Likelihood", ff(results.fit.loglikelihood), results.fit.loglikelihood]
            );
        } else {
            data.push(
                outputStore.isMultiTumor
                    ? ["Slope Factor", ff(results.slope_factor), results.slope_factor]
                    : null,
                ["AIC", ff(results.fit.aic), results.fit.aic],
                [
                    <span key={0}>
                        <i>P</i>-value
                    </span>,
                    fractionalFormatter(results.gof.p_value),
                    results.gof.p_value,
                ],
                ["Model d.f.", ff(results.gof.df), results.gof.df],
                ["Log-Likelihood", ff(results.fit.loglikelihood), results.fit.loglikelihood],
                ["Chi²", ff(results.fit.chisq), results.fit.chisq]
            );
        }
        return <TwoColumnTable data={data} label="Modeling Summary" />;
    }
}
Summary.propTypes = {
    outputStore: PropTypes.object,
};
export default Summary;
