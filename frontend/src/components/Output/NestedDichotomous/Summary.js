import {observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";

import TwoColumnTable from "@/components/common/TwoColumnTable";
import {ff} from "@/utils/formatters";

@observer
class Summary extends Component {
    render() {
        const {results} = this.props,
            data = [
                ["BMD", ff(results.summary.bmd)],
                ["BMDL", ff(results.summary.bmdl)],
                ["BMDU", ff(results.summary.bmdu)],
                ["AIC", ff(results.summary.aic)],
                [
                    <span key={0}>
                        <i>P</i>-value
                    </span>,
                    ff(results.combined_pvalue),
                ],
                ["D.O.F.", ff(results.dof)],
                [
                    <span key={1}>
                        Chi<sup>2</sup>
                    </span>,
                    ff(results.summary.chi_squared),
                ],
            ];
        return <TwoColumnTable label="Summary" data={data} />;
    }
}
Summary.propTypes = {
    model: PropTypes.object,
    results: PropTypes.object.isRequired,
};

export default Summary;
