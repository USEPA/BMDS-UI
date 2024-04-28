import {observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";

import Table from "@/components/common/Table";
import {ff, fractionalFormatter} from "@/utils/formatters";

@observer
class ContinuousTestOfInterest extends Component {
    render() {
        const {store} = this.props,
            testInterest = store.modalModel.results.tests,
            data = {
                headers: [
                    "Test",
                    "-2 * Log(Likelihood Ratio)",
                    "Test d.f.",
                    <span key={1}>
                        <i>P</i>-Value
                    </span>,
                ],
                rows: testInterest.names.map((name, i) => [
                    `Test ${i + 1}`,
                    ff(testInterest.ll_ratios[i]),
                    ff(testInterest.dfs[i]),
                    fractionalFormatter(testInterest.p_values[i]),
                ]),
                subheader: "Tests of Mean and Variance Fits",
                tblClasses: "table table-sm table-bordered text-right col-l-1",
            };
        return <Table data={data} />;
    }
}
ContinuousTestOfInterest.propTypes = {
    store: PropTypes.object,
};
export default ContinuousTestOfInterest;
