import {inject, observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";

import HelpTextPopover from "@/components/common/HelpTextPopover";
import Table from "@/components/common/Table";
import {ff, fractionalFormatter} from "@/utils/formatters";

const testDescriptionText = {
    1: "Test the null hypothesis that responses and variances don't differ among dose levels (A2 vs R).  If this test fails to reject the null hypothesis (p-value > 0.05), there may not be a dose-response.",
    2: "Test the null hypothesis that variances are homogenous (A1 vs A2).  If this test fails to reject the null hypothesis (p-value > 0.05), the simpler constant variance model may be appropriate.",
    3: "Test the null hypothesis that the variances are adequately modeled (A3 vs A2). If this test fails to reject the null hypothesis (p-value > 0.05), it may be inferred that the variances have been modeled appropriately.",
    4: "Test the null hypothesis that the model for the mean fits the data (Fitted vs A3). If this test fails to reject the null hypothesis (p-value > 0.1), the user has support for use of the selected model.",
};

@inject("outputStore")
@observer
class ContinuousTestOfInterestDatasetFootnote extends Component {
    render() {
        const model = this.props.outputStore.selectedOutput.frequentist.models[0],
            {p_values} = model.results.tests;
        return (
            <>
                <p className="text-muted my-0">
                    Test 1<HelpTextPopover title={"Test 1"} content={testDescriptionText[1]} />
                    &nbsp;Dose Response: {fractionalFormatter(p_values[0])}
                </p>
                <p className="text-muted my-0">
                    Test 2<HelpTextPopover title={"Test 2"} content={testDescriptionText[2]} />
                    &nbsp;Homogeneity of Variance: {fractionalFormatter(p_values[1])}
                </p>
                <p className="text-muted my-0">
                    Test 3<HelpTextPopover title={"Test 3"} content={testDescriptionText[3]} />
                    &nbsp;Variance Model Selection: {fractionalFormatter(p_values[2])}
                </p>
            </>
        );
    }
}
ContinuousTestOfInterestDatasetFootnote.propTypes = {
    outputStore: PropTypes.object,
};

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
                    <span key={i}>
                        Test {i + 1}
                        <HelpTextPopover
                            title={`Test ${i + 1}`}
                            content={testDescriptionText[i + 1]}
                        />
                    </span>,
                    ff(testInterest.ll_ratios[i]),
                    ff(testInterest.dfs[i]),
                    fractionalFormatter(testInterest.p_values[i]),
                ]),
                subheader: "Tests of Mean and Variance Fits",
                tblClasses: "table table-sm text-right col-l-1",
            };
        return <Table data={data} />;
    }
}
ContinuousTestOfInterest.propTypes = {
    store: PropTypes.object,
};
export {ContinuousTestOfInterestDatasetFootnote};
export default ContinuousTestOfInterest;
