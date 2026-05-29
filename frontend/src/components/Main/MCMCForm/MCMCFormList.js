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
      optionsList = toJS(MCMCStore.optionsList);
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
                {optionsList.map((options, id) => (
                  <MCMCForm
                    key={id}
                    idx={id}
                    options={options}
                    saveOptions={MCMCStore.saveOptions}
                  />
                ))}
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
