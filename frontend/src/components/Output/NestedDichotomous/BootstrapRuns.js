import _ from "lodash";
import {observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";

import Table from "@/components/common/Table";
import {ff, fractionalFormatter} from "@/utils/formatters";

const getData = function(model) {
    const results = model.results.bootstrap,
        finalIdx = results.p_value.length - 1,
        rows = _.range(results.p_value.length).map(idx => {
            return idx === finalIdx
                ? [
                      <span key={0} className="font-weight-bold">
                          Combined
                      </span>,
                      <span key={1} className="font-weight-bold">
                          {fractionalFormatter(results.p_value[idx])}
                      </span>,
                      <span key={2} className="font-weight-bold">
                          {ff(results.p50[idx])}
                      </span>,
                      <span key={3} className="font-weight-bold">
                          {ff(results.p90[idx])}
                      </span>,
                      <span key={4} className="font-weight-bold">
                          {ff(results.p95[idx])}
                      </span>,
                      <span key={5} className="font-weight-bold">
                          {ff(results.p99[idx])}
                      </span>,
                  ]
                : [
                      idx + 1,
                      fractionalFormatter(results.p_value[idx]),
                      ff(results.p50[idx]),
                      ff(results.p90[idx]),
                      ff(results.p95[idx]),
                      ff(results.p99[idx]),
                  ];
        });

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
