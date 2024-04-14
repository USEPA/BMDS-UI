import {toJS} from "mobx";
import {inject, observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";

import TwoColumnTable from "@/components/common/TwoColumnTable";
import * as mc from "@/constants/mainConstants";
import {ff, fourDecimalFormatter, fractionalFormatter} from "@/utils/formatters";

@inject("outputStore")
@observer
class Summary extends Component {
    render() {
        const {outputStore} = this.props,
            model = outputStore.modalModel;
        let data;

        if (outputStore.isMultitumor) {
            data = [
                ["BMD", ff(model.bmd), model.bmd],
                ["BMDL", ff(model.bmdl), model.bmdl],
                ["BMDU", ff(model.bmdu), model.bmdu],
                ["Slope Factor", ff(model.slope_factor), model.slope_factor],
                ["AIC", ff(model.fit.aic), model.fit.aic],
                [
                    <span key="0">
                        <i>P</i>-Value
                    </span>,
                    fourDecimalFormatter(model.gof.p_value),
                ],
                ["Overall d.f.", ff(model.gof.df)],
                ["Chi²", ff(model.fit.chisq)],
                ["-2* Log(Likelihood Ratio)", ff(model.fit.loglikelihood)],
            ];
        } else if (outputStore.isNestedDichotomous) {
            data = [
                ["BMD", ff(model.results.bmd), model.results.bmd],
                ["BMDL", ff(model.results.summary.bmdl), model.results.summary.bmdl],
                ["BMDU", ff(model.results.summary.bmdu), model.results.summary.bmdu],
                ["AIC", ff(model.results.summary.aic), model.results.summary.aic],
                [
                    <span key={0}>
                        <i>P</i>-value
                    </span>,
                    ff(model.results.combined_pvalue),
                ],
                ["d.f.", ff(model.results.dof)],
                [
                    <span key={1}>
                        Chi<sup>2</sup>
                    </span>,
                    ff(model.results.summary.chi_squared),
                ],
            ];
        } else {
            console.log(toJS(model));
            console.log("bbb");
            const isContinuous = outputStore.getModelType === mc.MODEL_CONTINUOUS,
                results = model.bmd ? model : model.results,
                p_value = isContinuous ? results.tests.p_values[3] : results.gof.p_value,
                df = isContinuous ? results.tests.p_values[3] : results.gof.df;
            data = [
                ["BMD", ff(results.bmd), results.bmd],
                ["BMDL", ff(results.bmdl), results.bmdl],
                ["BMDU", ff(results.bmdu), results.bmdu],
                ["AIC", ff(results.fit.aic), results.fit.aic],
                ["-2* Log(Likelihood Ratio)", ff(results.fit.loglikelihood)],
                [
                    <span key={0}>
                        <i>P</i>-value
                    </span>,
                    fractionalFormatter(p_value),
                ],
                ["Model d.f.", ff(df)],
            ];
        }

        return <TwoColumnTable id="info-table" data={data} label="Modeling Summary" />;
    }
}
Summary.propTypes = {
    outputStore: PropTypes.object,
};
export default Summary;
