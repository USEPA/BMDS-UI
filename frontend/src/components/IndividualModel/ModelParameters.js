import _ from "lodash";
import { observer } from "mobx-react";
import PropTypes from "prop-types";
import React, { Component } from "react";

import HelpTextPopover from "@/components/common/HelpTextPopover";
import Table from "@/components/common/Table";
import { parameterFormatter } from "@/utils/formatters";

const seFootnote = (
    <p className="text-sm">
      Standard errors estimates are not generated for parameters estimated on
      corresponding bounds, although sampling error is present for all
      parameters, as a rule. Standard error estimates may not be reliable as a
      basis for confidence intervals or tests when one or more parameters are on
      bounds.
    </p>
  ),
  getData = (model) => {
    const parameters = model.results.parameters,
      indexes = _.range(parameters.names.length),
      anyBounded = _.sum(parameters.bounded) > 0;

    return {
      tblClasses: "table table-sm text-right col-l-1",
      headers: ["Variable", "Estimate", "Standard Error"],
      subheader: "Model Parameters",
      rows: indexes.map((i) => {
        const bounded = parameters.bounded[i];
        return [
          parameters.names[i],
          bounded ? (
            <div key={i}>
              <span>On Bound</span>
              <HelpTextPopover
                title="On Bound"
                content={`The value of this parameter, ${parameters.values[i]}, is within the tolerance of the bound`}
              />
            </div>
          ) : (
            parameterFormatter(parameters.values[i])
          ),
          bounded ? "Not Reported" : parameterFormatter(parameters.se[i]),
        ];
      }),
      footnotes: anyBounded ? seFootnote : null,
    };
  },
  getLOUDData = (model, LOUDParameters) => {
    const suffix = model.name.match(/\((CV|NCV|Lognormal)\)$/)?.[1];
    const base_model = model.name
      .replace(/\s*\((CV|NCV|Lognormal)\)$/, "")
      .trim();

    return LOUDParameters.filter((group) => group.name === base_model)
      .map((group) => {
        const columns = group.columns.filter((col) => col !== "Model");
        return {
          tblClasses: "table table-sm text-right w-100",
          headers: columns,
          subheader: `${model.name} model parameters`,
          rows: group.rows
            .filter((rows) => !suffix || rows.Model === suffix)
            .map((row) =>
              columns.map((col) => {
                const val = row[col] ?? "";
                return typeof val === "number"
                  ? parseFloat(val.toFixed(4))
                  : val;
              }),
            ),
        };
      })
      .filter((group) => group.rows.length > 0);
  },
  getNestedData = (model) => {
    const names = model.results.parameter_names,
      values = model.results.parameters,
      bounded = model.results.bounded,
      se = model.results.std_err,
      anyBounded = _.some(bounded);
    return {
      tblClasses: "table table-sm text-right col-l-1",
      headers: ["Variable", "Estimate", "Standard Error"],
      subheader: "Model Parameters",
      rows: _.range(names.length).map((i) => {
        return [
          names[i],
          bounded[i] ? (
            <div key={i}>
              <span>On Bound</span>
              <HelpTextPopover
                title="On Bound"
                content={`The value of this parameter, ${values[i]}, is within the tolerance of the bound`}
              />
            </div>
          ) : (
            parameterFormatter(values[i])
          ),
          bounded[i] ? "Not Reported" : parameterFormatter(se[i]),
        ];
      }),
      footnotes: anyBounded ? seFootnote : null,
    };
  };

@observer
class ModelParameters extends Component {
  render() {
    const { model, isNestedDichotomous, isLOUD, LOUDParameters } = this.props;

    if (isLOUD && LOUDParameters) {
      return (
        <>
          {getLOUDData(model, LOUDParameters).map((data) => (
            <Table key={data.subheader} data={data} />
          ))}
        </>
      );
    }

    if (isNestedDichotomous) {
      return <Table data={getNestedData(model)} />;
    }

    return <Table data={getData(model)} />;
  }
}
ModelParameters.propTypes = {
  isLOUD: PropTypes.bool.isRequired,
  isNestedDichotomous: PropTypes.bool.isRequired,
  LOUDParameters: PropTypes.array,
  model: PropTypes.object.isRequired,
};
export default ModelParameters;
