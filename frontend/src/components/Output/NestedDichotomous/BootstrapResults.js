import {observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";

import TwoColumnTable from "@/components/common/TwoColumnTable";
import {ff, fractionalFormatter} from "@/utils/formatters";

@observer
class BootstrapResult extends Component {
    render() {
        const {settings, results} = this.props.model;
        const data = [
            ["# Iterations", settings.bootstrap_iterations],
            ["Bootstrap Seed", ff(settings.bootstrap_seed)],
            ["Log-likelihood", ff(results.ll)],
            ["Observed Chi²", ff(results.chi_squared)],
            [
                <span key={0}>
                    Combined <i>P</i>-Value
                </span>,
                fractionalFormatter(results.combined_pvalue),
            ],
        ];
        return <TwoColumnTable data={data} label="Bootstrap Results" colwidths={[50, 50]} />;
    }
}
BootstrapResult.propTypes = {
    model: PropTypes.object,
};

export default BootstrapResult;
