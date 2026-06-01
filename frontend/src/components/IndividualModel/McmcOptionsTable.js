import { observer } from "mobx-react";
import PropTypes from "prop-types";
import React, { Component } from "react";

import TwoColumnTable from "@/components/common/TwoColumnTable";
import { ff } from "@/utils/formatters";

@observer
class McmcOptionsTable extends Component {
  render() {
    const { model } = this.props,
      data = [
        ["Seed", "FUTURE"],
        ["# Chains", "FUTURE"],
        ["# Iterations per Chain", ff(model.settings.samples)],
        ["Burn In", ff(model.settings.burnin)],
      ];

    return (
      <TwoColumnTable data={data} label="Markov Chain Monte Carlo Options" />
    );
  }
}
McmcOptionsTable.propTypes = {
  model: PropTypes.object.isRequired,
};
export default McmcOptionsTable;
