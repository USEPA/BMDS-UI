import { toJS } from "mobx";
import { inject, observer } from "mobx-react";
import PropTypes from "prop-types";
import React, { Component } from "react";

import { MODEL_CONTINUOUS, MODEL_DICHOTOMOUS } from "@/constants/mainConstants";

import MCMCOptionsForm from "./MCMCOptionsForm";

@inject(({ MCMCOptionsStore }) => ({
  MCMCOptionsStore,
}))
@observer
class MCMCOptionsFormList extends Component {
  render() {
    const { MCMCOptionsStore } = this.props,
      modelType = MCMCOptionsStore.getModelType,
      optionsList = toJS(MCMCOptionsStore.optionsList);
    return (
      <div>
        <div className="panel panel-default">
          <form className="form-horizontal">
            <table className="table table-sm table-fixed">
              <thead className="bg-custom">
                <tr>
                  <th>MCMC Option Set #</th>
                  {modelType === MODEL_CONTINUOUS ? (
                    <>
                      <th>BMR Type</th>
                      <th>BMRF</th>
                      <th>Tail Probability</th>
                      <th>Confidence Level (one sided)</th>
                      <th>
                        Distribution +<br />
                        Variance&nbsp;
                      </th>
                    </>
                  ) : null}
                  {modelType === MODEL_DICHOTOMOUS ? (
                    <>
                      <th>Risk Type</th>
                      <th>BMR</th>
                      <th>Confidence Level (one sided)</th>
                    </>
                  ) : null}
                </tr>
              </thead>
              <tbody>
                {optionsList.map((options, id) => (
                  <MCMCOptionsForm
                    key={id}
                    idx={id}
                    options={options}
                    modelType={modelType}
                    deleteOptions={MCMCOptionsStore.deleteOptions}
                    saveOptions={MCMCOptionsStore.saveOptions}
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

MCMCOptionsFormList.propTypes = {
  MCMCOptionsStore: PropTypes.object,
};

export default MCMCOptionsFormList;
