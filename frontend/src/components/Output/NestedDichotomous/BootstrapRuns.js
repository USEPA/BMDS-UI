import _ from "lodash";
import {observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";

import {ff} from "@/utils/formatters";

@observer
class BootstrapRuns extends Component {
    render() {
        const results = this.props.model.results.bootstrap;
        return (
            <table className="table table-sm table-bordered">
                <thead className="bg-custom">
                    <tr>
                        <th colSpan="6">Bootstrap Runs</th>
                    </tr>
                    <tr>
                        <th>Run</th>
                        <th>
                            <i>P</i>-Value
                        </th>
                        <th>50th</th>
                        <th>90th</th>
                        <th>95th</th>
                        <th>99th</th>
                    </tr>
                </thead>
                <tbody>
                    {_.range(results.n_runs).map(run => {
                        return (
                            <tr key={run}>
                                <td>{run + 1}</td>
                                <td>{results.p_value[run]}</td>
                                <td>{ff(results.p50[run])}</td>
                                <td>{ff(results.p90[run])}</td>
                                <td>{ff(results.p95[run])}</td>
                                <td>{ff(results.p99[run])}</td>
                            </tr>
                        );
                    })}
                    <tr>
                        <td>Combined</td>
                        <td>{results.p_value[3]}</td>
                        <td>{ff(results.p50[3])}</td>
                        <td>{ff(results.p90[3])}</td>
                        <td>{ff(results.p95[3])}</td>
                        <td>{ff(results.p99[3])}</td>
                    </tr>
                </tbody>
            </table>
        );
    }
}
BootstrapRuns.propTypes = {
    model: PropTypes.object,
};
export default BootstrapRuns;
