import {inject, observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";

import TwoColumnTable from "@/components/common/TwoColumnTable";
import {ff, fourDecimalFormatter, fractionalFormatter} from "@/utils/formatters";

@inject("outputStore")
@observer
class Summary extends Component {
    render() {
        const {outputStore} = this.props;
        let data;

        if (outputStore.isMultitumor) {
            data = [
                ["BMD", ff(outputStore.modalModel.bmd)],
                ["BMDL", ff(outputStore.modalModel.bmdl)],
                ["BMDU", ff(outputStore.modalModel.bmdu)],
                ["Slope Factor", ff(outputStore.modalModel.slope_factor)],
                ["AIC", ff(outputStore.modalModel.fit.aic)],
                [
                    <span key="0">
                        <i>P</i>-Value
                    </span>,
                    fourDecimalFormatter(outputStore.modalModel.gof.p_value),
                ],
                ["Overall d.f.", ff(outputStore.modalModel.gof.df)],
                ["Chi²", ff(outputStore.modalModel.fit.chisq)],
                ["-2* Log(Likelihood Ratio)", ff(outputStore.modalModel.fit.loglikelihood)],
            ];
        } else if (outputStore.isNestedDichotomous) {
            data = [
                ["BMD", ff(outputStore.modalModel.results.bmd)],
                ["BMDL", ff(outputStore.modalModel.results.summary.bmdl)],
                ["BMDU", ff(outputStore.modalModel.results.summary.bmdu)],
                ["AIC", ff(outputStore.modalModel.results.summary.aic)],
                [
                    <span key={0}>
                        <i>P</i>-value
                    </span>,
                    ff(outputStore.modalModel.results.combined_pvalue),
                ],
                ["d.f.", ff(outputStore.modalModel.results.dof)],
                [
                    <span key={1}>
                        Chi<sup>2</sup>
                    </span>,
                    ff(outputStore.modalModel.results.summary.chi_squared),
                ],
            ];
        } else {
            const p_value = outputStore.modalModel.results.tests.p_values[3];
            data = [
                ["BMD", ff(outputStore.modalModel.results.bmd)],
                ["BMDL", ff(outputStore.modalModel.results.bmdl)],
                ["BMDU", ff(outputStore.modalModel.results.bmdu)],
                ["AIC", ff(outputStore.modalModel.results.fit.aic)],
                ["-2* Log(Likelihood Ratio)", ff(outputStore.modalModel.results.fit.loglikelihood)],
                [
                    <span key={0}>
                        <i>P</i>-value
                    </span>,
                    fractionalFormatter(p_value),
                ],
                ["Model d.f.", ff(outputStore.modalModel.results.tests.dfs[3])],
            ];
        }

        return <TwoColumnTable id="info-table" data={data} label="Modeling Summary" />;
    }
}
Summary.propTypes = {
    outputStore: PropTypes.object,
};
export default Summary;
