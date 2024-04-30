import _ from "lodash";
import {observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";

import Table from "@/components/common/Table";
import {ff} from "@/utils/formatters";

@observer
class CDFTable extends Component {
    render() {
        const {bmd_dist} = this.props,
            data = {
                headers: ["Cumulative Probability", "BMD"],
                rows: _.range(bmd_dist[0].length).map(i => [
                    ff(bmd_dist[1][i]),
                    ff(bmd_dist[0][i]),
                ]),
                tblClasses: "table table-sm text-right col-l-1",
            };
        return <Table data={data} />;
    }
}
CDFTable.propTypes = {
    bmd_dist: PropTypes.array,
};

export default CDFTable;
