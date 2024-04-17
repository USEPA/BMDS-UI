import _ from "lodash";
import {observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";

import {ff} from "@/utils/formatters";

@observer
class CDFTable extends Component {
    render() {
        const {bmd_dist} = this.props;
        return (
            <table className="table table-sm table-bordered text-right">
                <colgroup>
                    <col width="50%" />
                    <col width="50%" />
                </colgroup>
                <thead className="sticky-top">
                    <tr className="bg-custom text-left">
                        <th colSpan="2">CDF</th>
                    </tr>
                    <tr>
                        <th>Cumulative Probability</th>
                        <th>BMD</th>
                    </tr>
                </thead>
                <tbody>
                    {bmd_dist[0].length == 0 ? (
                        <tr>
                            <td colSpan={2}>
                                <i>No data available.</i>
                            </td>
                        </tr>
                    ) : (
                        _.range(bmd_dist[0].length).map(i => {
                            return (
                                <tr key={i}>
                                    <td>{ff(bmd_dist[1][i])}</td>
                                    <td>{ff(bmd_dist[0][i])}</td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
        );
    }
}
CDFTable.propTypes = {
    bmd_dist: PropTypes.array,
};

export default CDFTable;
