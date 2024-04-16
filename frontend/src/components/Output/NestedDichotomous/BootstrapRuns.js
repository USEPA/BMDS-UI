import _ from "lodash";
import {observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";

import Table from "@/components/common/Table";
import {ff} from "@/utils/formatters";

const getData = function(model) {
    const results = model.results.bootstrap,
        rows = _.range(results.n_runs).map(run => [
            run + 1,
            results.p_value[run],
            ff(results.p50[run]),
            ff(results.p90[run]),
            ff(results.p95[run]),
            ff(results.p99[run]),
        ]);
    rows.push([
        "Combined",
        results.p_value[3],
        ff(results.p50[3]),
        ff(results.p90[3]),
        ff(results.p95[3]),
        ff(results.p99[3]),
    ]);

    return {
        headers: [
            "Run",
            <span key="p-value">
                <i>P</i>-Value
            </span>,
            "50th",
            "90th",
            "95th",
            "99th",
        ],
        subheader: "Bootstrap Runs",
        rows,
    };
};

@observer
class BootstrapRuns extends Component {
    render() {
        return <Table data={getData(this.props.model)} />;
    }
}
BootstrapRuns.propTypes = {
    model: PropTypes.object,
};
export default BootstrapRuns;
