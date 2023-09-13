import {observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";

import {ff, fourDecimalFormatter} from "@/utils/formatters";

@observer
class Summary extends Component {
    render() {
        const dataset = this.props.model;
        return (
            <table className="table table-sm table-bordered col-r-2">
                <colgroup>
                    <col width="60%" />
                    <col width="40%" />
                </colgroup>
                <thead>
                    <tr className="bg-custom">
                        <th colSpan="2">Summary</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>BMD</td>
                        <td>{ff(dataset.bmd)}</td>
                    </tr>
                    <tr>
                        <td>BMDL</td>
                        <td>{ff(dataset.bmdl)}</td>
                    </tr>
                    <tr>
                        <td>BMDU</td>
                        <td>{ff(dataset.bmdu)}</td>
                    </tr>
                    <tr>
                        <td>AIC</td>
                        <td>{ff(dataset.fit.aic)}</td>
                    </tr>
                    <tr>
                        <td>Log Likelihood</td>
                        <td>{ff(dataset.fit.loglikelihood)}</td>
                    </tr>
                    <tr>
                        <td>
                            <i>P</i>-Value
                        </td>
                        <td>{fourDecimalFormatter(dataset.gof.p_value)}</td>
                    </tr>
                    <tr>
                        <td>Overall DOF</td>
                        <td>{ff(dataset.gof.df)}</td>
                    </tr>
                    <tr>
                        <td>Chi²</td>
                        <td>{ff(dataset.fit.chisq)}</td>
                    </tr>
                </tbody>
            </table>
        );
    }
}

Summary.propTypes = {
    model: PropTypes.object,
};

export default Summary;
