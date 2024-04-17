import {observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";

import {ff, fractionalFormatter} from "@/utils/formatters";

import HelpTextPopover from "../common/HelpTextPopover";

@observer
class ContinuousTestOfInterest extends Component {
    render() {
        const {store} = this.props,
            testInterest = store.modalModel.results.tests;

        return (
            <table className="table table-sm table-bordered text-right col-l-1">
                <colgroup>
                    <col width="25%" />
                    <col width="25%" />
                    <col width="25%" />
                    <col width="25%" />
                </colgroup>
                <thead>
                    <tr className="bg-custom text-left">
                        <th colSpan="4">Tests of Mean and Variance Fits</th>
                    </tr>
                    <tr>
                        <th>Test</th>
                        <th>
                            LLR
                            <HelpTextPopover title="LLR" content="2 * Log(Likelihood Ratio)" />
                        </th>
                        <th>Test d.f.</th>
                        <th>
                            <i>P</i>-Value
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {testInterest.names.map((name, i) => {
                        return (
                            <tr key={i}>
                                <td>Test {i + 1}</td>
                                <td>{ff(testInterest.ll_ratios[i])}</td>
                                <td>{ff(testInterest.dfs[i])}</td>
                                <td>{fractionalFormatter(testInterest.p_values[i])}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        );
    }
}
ContinuousTestOfInterest.propTypes = {
    store: PropTypes.object,
};
export default ContinuousTestOfInterest;
