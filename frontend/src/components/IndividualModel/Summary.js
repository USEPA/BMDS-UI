import {inject, observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";

import TwoColumnTable from "@/components/common/TwoColumnTable";
import * as mc from "@/constants/mainConstants";
import {ff, fractionalFormatter} from "@/utils/formatters";

@inject("outputStore")
@observer
class Summary extends Component {
    render() {
        const {outputStore} = this.props,
            model = outputStore.modalModel;
        let data;
        if (outputStore.isNestedDichotomous) {
            data = [
                ["BMD", ff(model.results.bmd), model.results.bmd],
                ["BMDL", ff(model.results.bmdl), model.results.bmdl],
                ["AIC", ff(model.results.aic), model.results.aic],
                [
                    <span key={0}>
                        <i>P</i>-value
                    </span>,
                    fractionalFormatter(model.results.combined_pvalue),
                ],
                ["Model d.f.", ff(model.results.dof)],
                [<span key={1}>Chi²</span>, ff(model.results.chi_squared)],
            ];
        } else {
            const isContinuous = outputStore.getModelType === mc.MODEL_CONTINUOUS,
                results = model.bmd ? model : model.results,
                p_value = isContinuous ? results.tests.p_values[3] : results.gof.p_value,
                df = isContinuous ? results.tests.p_values[3] : results.gof.df;
            data = [
                ["BMD", ff(results.bmd), results.bmd],
                ["BMDL", ff(results.bmdl), results.bmdl],
                ["BMDU", ff(results.bmdu), results.bmdu],
                ["AIC", ff(results.fit.aic), results.fit.aic],
                ["Log-Likelihood", ff(results.fit.loglikelihood)],
                [
                    <span key={0}>
                        <i>P</i>-value
                    </span>,
                    fractionalFormatter(p_value),
                ],
                ["Model d.f.", ff(df)],
            ];
            if (outputStore.isMultiTumor) {
                data.splice(3, 0, ["Slope Factor", ff(results.slope_factor), results.slope_factor]);
            }
        }

        return <TwoColumnTable data={data} label="Modeling Summary" />;
    }
}
Summary.propTypes = {
    outputStore: PropTypes.object,
};
export default Summary;
