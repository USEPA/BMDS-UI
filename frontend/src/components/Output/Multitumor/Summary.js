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
        return <TwoColumnTable data={data} label="Modeling Summary" />;
    }
}

Summary.propTypes = {
    model: PropTypes.object,
};

export default Summary;
