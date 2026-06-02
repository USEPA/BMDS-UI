import _ from "lodash";
import { inject, observer } from "mobx-react";
import PropTypes from "prop-types";
import React, { Component } from "react";

import { ff } from "@/utils/formatters";
import HelpTextPopover from "../common/HelpTextPopover";

@inject("mcmcStore")
@observer
class McmcSetTable extends Component {
  render() {
    const { mcmcStore } = this.props,
      { optionsDict } = mcmcStore,
      rows = [
        ["Seed", ff(optionsDict.seed)],
        ["# Chains", ff(optionsDict.n_chains)],
        ["# Iterations per chain", ff(optionsDict.iterations_per_chain)],
        ["Burn In", ff(optionsDict.burnin)],
      ];

    return (
      <>
        <div className="label">
          <label>
            Markov Chain Monte Carlo Options{" "}
            <HelpTextPopover
              title={"Note"}
              content={"MCMC settings apply to LOUD model results only"}
            />{" "}
          </label>
        </div>
        <table className="table table-sm text-right">
          <colgroup>
            <col width="60%" />
            <col width="40%" />
          </colgroup>
          <tbody>
            {rows
              .filter((d) => !_.isNull(d))
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
McmcSetTable.propTypes = {
  mcmcStore: PropTypes.object,
};

export default McmcSetTable;
