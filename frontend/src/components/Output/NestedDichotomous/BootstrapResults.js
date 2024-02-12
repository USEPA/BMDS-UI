import {observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";

import TwoColumnTable from "@/components/common/TwoColumnTable";
import {ff} from "@/utils/formatters";

@observer
class BootstrapResult extends Component {
    render() {
        const {settings, results} = this.props.model,
            data = [
                ["# Iterations", settings.bootstrap_iterations],
                ["Bootstrap Seed", ff(settings.bootstrap_seed)],
                ["-2* Log(Likelihood Ratio)", ff(results.ll)],
                ["Observed Chi-square", ff(results.obs_chi_sq)],
                [
                    <span key={0}>
                        Combined <i>P</i>-Value
                    </span>,
                    ff(results.combined_pvalue),
                ],
            ];
        return <TwoColumnTable data={data} label="Bootstrap Results" colwidths={[40, 60]} />;
    }
}
BootstrapResult.propTypes = {
    model: PropTypes.object,
};

export default BootstrapResult;
