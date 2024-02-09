import _ from "lodash";
import {observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";

import HelpTextPopover from "@/components/common/HelpTextPopover";
import {parameterFormatter} from "@/utils/formatters";

@observer
class ModelParameters extends Component {
    render() {
        const {parameters} = this.props,
            indexes = _.range(parameters.names.length),
            anyBounded = _.sum(parameters.bounded) > 0;

        return (
            <>
                <table className="table table-sm table-bordered text-right col-l-1">
                    <colgroup>
                        <col width="34%" />
                        <col width="33%" />
                        <col width="33%" />
                    </colgroup>
                    <thead>
                        <tr className="bg-custom">
                            <th colSpan="3">Model Parameters</th>
                        </tr>
                        <tr>
                            <th>Variable</th>
                            <th>Estimate</th>
                            <th>Standard Error</th>
                        </tr>
                    </thead>
                    <tbody>
                        {indexes.map(i => {
                            const bounded = parameters.bounded[i];
                            return (
                                <tr key={i}>
                                    <td>{parameters.names[i]}</td>
                                    <td>
                                        {bounded ? (
                                            <>
                                                <span>On Bound</span>
                                                <HelpTextPopover
                                                    title="On Bound"
                                                    content={`The value of this parameter, ${parameters.values[i]}, is within the tolerance of the bound`}
                                                />
                                            </>
                                        ) : (
                                            parameterFormatter(parameters.values[i])
                                        )}
                                    </td>
                                    <td>
                                        {bounded
                                            ? "Not Reported"
                                            : parameterFormatter(parameters.se[i])}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {anyBounded ? (
                    <p>
                        Standard errors estimates are not generated for parameters estimated on
                        corresponding bounds, although sampling error is present for all parameters,
                        as a rule. Standard error estimates may not be reliable as a basis for
                        confidence intervals or tests when one or more parameters are on bounds.
                    </p>
                ) : null}
            </>
        );
    }
}
ModelParameters.propTypes = {
    parameters: PropTypes.object.isRequired,
};
export default ModelParameters;
