import _ from "lodash";
import { inject, observer } from "mobx-react";
import PropTypes from "prop-types";
import React, { Component } from "react";

@inject("outputStore")
@observer
class CochranArmitageTable extends Component {
  render() {
    const { outputStore } = this.props,
      { selectedDatasetCochranArmitage } = outputStore;

    const rows = Object.entries(selectedDatasetCochranArmitage).map(
      ([k, v]) => [k, v],
    );

    return (
      <>
        <div className="label">
          <label>Cochran-Armitage</label>
        </div>
        <table className="table table-sm text-right">
          <colgroup>
            <col width="60%" />
            <col width="40%" />
          </colgroup>
          <tbody>
            {rows
              .filter((d) => !_.isNull(d) && d[0] !== "name")
              .map((d, i) => {
                return (
                  <tr key={i}>
                    <th className="bg-custom">{d[0]}</th>
                    <td>{d[1]}</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </>
    );
  }
}
CochranArmitageTable.propTypes = {
  outputStore: PropTypes.object,
};

export default CochranArmitageTable;
