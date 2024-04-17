import _ from "lodash";
import {observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";

import HelpTextPopover from "@/components/common/HelpTextPopover";
import Table from "@/components/common/Table";
import {parameterFormatter} from "@/utils/formatters";

const getData = function(model) {
        const parameters = model.results.parameters,
            indexes = _.range(parameters.names.length),
            anyBounded = _.sum(parameters.bounded) > 0;

        return {
            headers: ["Variable", "Estimate", "Standard Error"],
            subheader: "Model Parameters",
            rows: indexes.map(i => {
                const bounded = parameters.bounded[i];
                return [
                    parameters.names[i],
                    bounded ? (
                        <>
                            <span>On Bound</span>
                            <HelpTextPopover
                                title="On Bound"
                                content={`The value of this parameter, ${parameters.values[i]}, is within the tolerance of the bound`}
                            />
                        </>
                    ) : (
                        parameterFormatter(parameters.values[i])
                    ),
                    bounded ? "Not Reported" : parameterFormatter(parameters.se[i]),
                ];
            }),
            footnotes: anyBounded ? (
                <p>
                    Standard errors estimates are not generated for parameters estimated on
                    corresponding bounds, although sampling error is present for all parameters, as
                    a rule. Standard error estimates may not be reliable as a basis for confidence
                    intervals or tests when one or more parameters are on bounds.
                </p>
            ) : null,
        };
    },
    getNestedData = function(model) {
        const names = model.results.parameter_names,
            values = model.results.parameters;
        return {
            headers: ["Variable", "Estimate"],
            rows: _.range(_.size(names)).map(i => [names[i], values[i]]),
            subheader: "Model Parameters",
        };
    };

@observer
class ModelParameters extends Component {
    render() {
        const {model, isNestedDichotomous} = this.props,
            fn = isNestedDichotomous ? getNestedData : getData;
        return <Table data={fn(model)} />;
    }
}
ModelParameters.propTypes = {
    isNestedDichotomous: PropTypes.bool.isRequired,
    model: PropTypes.object.isRequired,
};
export default ModelParameters;
