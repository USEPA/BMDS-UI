import _ from "lodash";
import {observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";

import Table from "@/components/common/Table";
import {ff, fractionalFormatter} from "@/utils/formatters";

const getData = function(model) {
    const results = model.results.bootstrap,
        finalIdx = results.p_value.length - 1,
        rows = _.range(results.p_value.length).map(idx => [
            idx === finalIdx ? "Combined" : idx + 1,
            fractionalFormatter(results.p_value[idx]),
            ff(results.p50[idx]),
            ff(results.p90[idx]),
            ff(results.p95[idx]),
            ff(results.p99[idx]),
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
        tblClasses: "table table-sm text-right",
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
