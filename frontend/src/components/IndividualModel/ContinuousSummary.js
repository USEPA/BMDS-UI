import {observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";

import {ff, fractionalFormatter} from "@/utils/formatters";

@observer
class ContinuousSummary extends Component {
    render() {
        const {store} = this.props,
            results = store.modalModel.results,
            p_value = results.tests.p_values[3];

        return (
            <table className="table table-sm table-bordered col-r-2">
                <colgroup>
                    <col width="60%" />
                    <col width="40%" />
                </colgroup>
                <thead>
                    <tr className="bg-custom">
                        <th colSpan="2">Modeling Summary</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>BMD</td>
                        <td>{ff(results.bmd)}</td>
                    </tr>
                    <tr>
                        <td>BMDL</td>
                        <td>{ff(results.bmdl)}</td>
                    </tr>
                    <tr>
                        <td>BMDU</td>
                        <td>{ff(results.bmdu)}</td>
                    </tr>
                    <tr>
                        <td>AIC</td>
                        <td>{ff(results.fit.aic)}</td>
                    </tr>
                    <tr>
                        <td>-2* Log(Likelihood Ratio)</td>
                        <td>{ff(results.fit.loglikelihood)}</td>
                    </tr>
                    <tr>
                        <td>
                            <i>P</i>-Value
                        </td>
                        <td>{fractionalFormatter(p_value)}</td>
                    </tr>
                    <tr>
                        <td>Model d.f.</td>
                        <td>{ff(results.tests.dfs[3])}</td>
                    </tr>
                </tbody>
            </table>
        );
    }
}

ContinuousSummary.propTypes = {
    store: PropTypes.object,
};

export default ContinuousSummary;
