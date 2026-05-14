import { inject, observer } from "mobx-react";
import PropTypes from "prop-types";
import React, { Component } from "react";

import { Dtype } from "@/constants/dataConstants";

import HelpTextPopover from "../../common/HelpTextPopover";
import DatasetModelOption from "./DatasetModelOption";

const maxDegreeText = `<p>Relevant for Maximum Likelihood Estimate methods only.</p> <p>Studies have indicated that higher degree polynomial models are not
    warranted in that they generally do not sufficiently improve fit over simpler models
    (Nitcheva et al., 2007; PMC2040324).<br>Complex models also increase computer processing time
    and the chance of model failure.</p>`,
  multiTumorDegreeText = `Degree used for each dataset. If set to auto (default), all degrees to N-1 are executed and the best-fitting is used. If a numeric value, only that degree will be modeled.`;

@inject("dataOptionStore")
@observer
class DatasetModelOptionList extends Component {
  render() {
    const { dataOptionStore } = this.props,
      { options } = dataOptionStore,
      dtype = dataOptionStore.getModelType;

    if (options.length == 0) {
      return null;
    }

    return (
      <table className="table table-sm table-fixed">
        <thead>
          {dtype == Dtype.CONTINUOUS || dtype == Dtype.CONTINUOUS_INDIVIDUAL ? (
            <tr className="bg-custom">
              <th>Enabled</th>
              <th>Dataset</th>
              <th>
                Maximum Polynomial Degree&nbsp;
                <HelpTextPopover content={maxDegreeText} title={"Note"} />
              </th>
              <th>Adverse Direction</th>
            </tr>
          ) : null}
          {dtype == Dtype.MULTI_TUMOR ? (
            <tr className="bg-custom">
              <th>Enabled</th>
              <th>Dataset</th>
              <th>
                Degree
                <HelpTextPopover
                  content={multiTumorDegreeText}
                  title={"Note"}
                />
              </th>
            </tr>
          ) : null}
          {dtype == Dtype.DICHOTOMOUS ? (
            <tr className="bg-custom">
              <th>Enabled</th>
              <th>Dataset</th>
              <th>
                Maximum Multistage Degree
                <HelpTextPopover content={maxDegreeText} title={"Note"} />
              </th>
            </tr>
          ) : null}
          {dtype == Dtype.NESTED_DICHOTOMOUS ? (
            <tr className="bg-custom">
              <th>Enabled</th>
              <th>Dataset</th>
            </tr>
          ) : null}
        </thead>
        <tbody>
          {options.map((option) => {
            return (
              <DatasetModelOption
                key={option.dataset_id}
                datasetId={option.dataset_id}
                store={dataOptionStore}
              />
            );
          })}
        </tbody>
      </table>
    );
  }
}
DatasetModelOptionList.propTypes = {
  dataOptionStore: PropTypes.object,
};
export default DatasetModelOptionList;
