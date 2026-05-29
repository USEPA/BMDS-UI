import { toJS } from "mobx";
import { inject, observer } from "mobx-react";
import PropTypes from "prop-types";
import React, { Component } from "react";

import MCMCForm from "./MCMCForm";

@inject("MCMCStore")
@observer
class MCMCFormList extends Component {
  render() {
    const { MCMCStore } = this.props,
      optionsDict = toJS(MCMCStore.optionsDict);
    return (
      <div>
        <div className="panel panel-default">
          <form className="form-horizontal">
            <table className="table table-sm table-fixed">
              <thead style={{ height: "50px" }} className="bg-custom">
                <tr>
                  <th>Markov Chain Monte Carlo</th>
                  <>
                    <th>Seed</th>
                    <th># Chains</th>
                    <th># Iterations per Chain</th>
                    <th>Burn In</th>
                  </>
                </tr>
              </thead>
              <tbody>
                <MCMCForm
                  key={`${MCMCStore.resetCount}`}
                  options={optionsDict}
                  saveOptions={MCMCStore.saveOptions}
                  setDefaults={() => MCMCStore.setDefaults(true)}
                />
              </tbody>
            </table>
          </form>
        </div>
      </div>
    );
  }
}

MCMCFormList.propTypes = {
  MCMCStore: PropTypes.object,
};

export default MCMCFormList;
