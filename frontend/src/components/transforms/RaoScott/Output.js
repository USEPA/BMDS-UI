import _ from "lodash";
import {toJS} from "mobx";
import {inject, observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";

import Table from "@/components/common/Table";

@inject("store")
@observer
class OutputTabs extends Component {
    render() {
        const {outputs} = this.props.store,
            {df} = outputs;
        return (
            <div>
                <h3>Results</h3>
                <Table
                    data={{
                        headers: ["Dose", "N", "Incidence", "Adjusted N", "Adjusted Incidence"],
                        rows: _.range(df.dose.length).map(i => [
                            df.dose[i],
                            df.n[i],
                            df.incidence[i],
                            df.scaled_n[i].toFixed(4),
                            df.scaled_incidence[i].toFixed(4),
                        ]),
                        tblClasses: "table table-sm table-striped table-hover text-right",
                    }}
                />
            </div>
        );
    }
}
OutputTabs.propTypes = {
    store: PropTypes.object,
};

export default OutputTabs;
