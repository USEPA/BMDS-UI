import {observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";

import {ff} from "@/utils/formatters";

@observer
class BootstrapResult extends Component {
    render() {
        return (
            <table className="table table-sm table-bordered">
                <thead className="bg-custom">
                    <tr>
                        <th colSpan="2">Bootstrap Results</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <th># Iterations</th>
                        <td>{this.props.model.settings.bootstrap_iterations}</td>
                    </tr>
                    <tr>
                        <th>Bootstrap Seed</th>
                        <td>{ff(this.props.model.settings.bootstrap_seed)}</td>
                    </tr>
                    <tr>
                        <th>Log-likelihood</th>
                        <td>{ff(this.props.model.results.ll)}</td>
                    </tr>
                    <tr>
                        <th>Observed Chi-square</th>
                        <td>{ff(this.props.model.results.obs_chi_sq)}</td>
                    </tr>
                    <tr>
                        <th>
                            Combined <i>P</i>-Value
                        </th>
                        <td>{ff(this.props.model.results.combined_pvalue)}</td>
                    </tr>
                </tbody>
            </table>
        );
    }
}
BootstrapResult.propTypes = {
    model: PropTypes.object,
};

export default BootstrapResult;
