import {inject, observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";

import {getLabel} from "@/common";
import {adverseDirectionOptions, allDegreeOptions} from "@/constants/dataConstants";
import {MODEL_CONTINUOUS, MODEL_DICHOTOMOUS} from "@/constants/mainConstants";
import {
    continuousBmrOptions,
    dichotomousBmrOptions,
    distTypeOptions,
    litterSpecificCovariateOptions,
} from "@/constants/optionsConstants";
import {isHybridBmr} from "@/constants/optionsConstants";
import {ff} from "@/utils/formatters";

@inject("outputStore")
@observer
class OptionSetTable extends Component {
    render() {
        const {outputStore} = this.props,
            {getModelType, selectedModelOptions, selectedDatasetOptions} = outputStore,
            option_index = outputStore.selectedOutput.option_index + 1;
        let rows;
        if (getModelType === MODEL_CONTINUOUS) {
            rows = [
                ["BMR Type", getLabel(selectedModelOptions.bmr_type, continuousBmrOptions)],
                ["BMRF", ff(selectedModelOptions.bmr_value)],
                ["Distribution Type", getLabel(selectedModelOptions.dist_type, distTypeOptions)],
                [
                    "Adverse Direction",
                    getLabel(selectedDatasetOptions.adverse_direction, adverseDirectionOptions),
                ],
                [
                    "Maximum Polynomial Degree",
                    getLabel(selectedDatasetOptions.degree, allDegreeOptions),
                ],
                isHybridBmr(selectedModelOptions.bmr_type)?
                    ["Tail Probability", ff(selectedModelOptions.tail_probability)]:
                    null,
                ["Confidence Level (one sided)", ff(selectedModelOptions.confidence_level)],
            ];
        } else if (getModelType === MODEL_DICHOTOMOUS) {
            rows = [
                ["BMR Type", getLabel(selectedModelOptions.bmr_type, dichotomousBmrOptions)],
                ["BMR", ff(selectedModelOptions.bmr_value)],
                ["Confidence Level (one sided)", ff(selectedModelOptions.confidence_level)],
                [
                    "Maximum Multistage Degree",
                    getLabel(selectedDatasetOptions.degree, allDegreeOptions),
                ],
            ];
        } else if (outputStore.isNestedDichotomous) {
            rows = [
                ["BMR Type", getLabel(selectedModelOptions.bmr_type, dichotomousBmrOptions)],
                ["BMR", ff(selectedModelOptions.bmr_value)],
                ["Confidence Level (one sided)", ff(selectedModelOptions.confidence_level)],
                ["Bootstrap Seed", selectedModelOptions.bootstrap_seed],
                ["Bootstrap Iterations", selectedModelOptions.bootstrap_iterations],
                [
                    "Litter Specific Covariate",
                    getLabel(
                        selectedModelOptions.litter_specific_covariate,
                        litterSpecificCovariateOptions
                    ),
                ],
            ];
        } else if (outputStore.isMultiTumor) {
            rows = [
                ["BMR Type", getLabel(selectedModelOptions.bmr_type, dichotomousBmrOptions)],
                ["BMR", ff(selectedModelOptions.bmr_value)],
                ["Confidence Level (one sided)", ff(selectedModelOptions.confidence_level)],
                ["Degree Setting", outputStore.multitumorDegreeInputSettings.join(", ")],
            ];
        } else {
            throw `Unknown model type: ${getModelType}`;
        }
        return (
            <>
                <div className="label">
                    <label>Option Set:&nbsp;</label>#{option_index}
                </div>
                <table className="table table-sm table-bordered text-right">
                    <colgroup>
                        <col width="60%" />
                        <col width="40%" />
                    </colgroup>
                    <tbody>
                        {rows.filter(d=>!_.isNull(d)).map((d, i) => {
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
OptionSetTable.propTypes = {
    outputStore: PropTypes.object,
};

export default OptionSetTable;
