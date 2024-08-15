import _ from "lodash";
import {observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";

import Table from "@/components/common/Table";
import {ff, fractionalFormatter} from "@/utils/formatters";

const getData = function(model) {
    const results = model.results.bootstrap,
        rows = _.range(results.p_value.length).map(run => [
            run + 1,
            fractionalFormatter(results.p_value[run]),
            ff(results.p50[run]),
            ff(results.p90[run]),
            ff(results.p95[run]),
            ff(results.p99[run]),
        ]);
    rows.push([
        <span key={0} className="font-weight-bold">
            Combined
        </span>,
        <span key={1} className="font-weight-bold">
            {fractionalFormatter(results.p_value[3])}
        </span>,
        <span key={2} className="font-weight-bold">
            {ff(results.p50[3])}
        </span>,
        <span key={3} className="font-weight-bold">
            {ff(results.p90[3])}
        </span>,
        <span key={4} className="font-weight-bold">
            {ff(results.p95[3])}
        </span>,
        <span key={5} className="font-weight-bold">
            {ff(results.p99[3])}
        </span>,
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
