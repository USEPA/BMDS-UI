import {observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";

import TwoColumnTable from "@/components/common/TwoColumnTable";
import {ff, fourDecimalFormatter} from "@/utils/formatters";

@observer
class Summary extends Component {
    render() {
        const {model} = this.props,
            data = [
                ["BMD", ff(model.bmd)],
                ["BMDL", ff(model.bmdl)],
                ["BMDU", ff(model.bmdu)],
                ["AIC", ff(model.fit.aic)],
                [
                    <span key="0">
                        <i>P</i>-Value
                    </span>,
                    fourDecimalFormatter(model.gof.p_value),
                ],
                ["Overall DOF", ff(model.gof.df)],
                ["Chi²", ff(model.fit.chisq)][("Log Likelihood", ff(model.fit.loglikelihood))],
                ["Slope Factor", "TODO"],
            ];
        return <TwoColumnTable data={data} label="Summary" />;
    }
}

Summary.propTypes = {
    model: PropTypes.object,
};

export default Summary;
