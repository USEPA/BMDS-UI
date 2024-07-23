import {observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";

import {checkOrEmpty, getLabel} from "@/common";
import {Dtype} from "@/constants/dataConstants";
import {
    adverseDirectionOptions,
    allDegreeOptions,
    getDegreeOptions,
} from "@/constants/dataConstants";

import CheckboxInput from "../../common/CheckboxInput";
import SelectInput from "../../common/SelectInput";

const getDegreeText = (dtype, degree) => {
    return degree === 0 && dtype == Dtype.MULTI_TUMOR ? "auto" : getLabel(degree, allDegreeOptions);
};

@observer
class DatasetModelOption extends Component {
    render() {
        const {datasetId, store} = this.props,
            option = store.options[datasetId],
            dataset = store.getDataset(option),
            {canEdit, updateOption} = store,
            dtype = store.getModelType,
            hasDegree = option.degree !== undefined,
            hasAdverseDirection = option.adverse_direction !== undefined;

        return canEdit ? (
            <tr>
                <td>
                    <CheckboxInput
                        checked={option.enabled}
                        onChange={checked => updateOption(datasetId, "enabled", checked)}
                    />
                </td>
                <td>{dataset.metadata.name}</td>
                {hasDegree ? (
                    <td>
                        <SelectInput
                            choices={getDegreeOptions(dtype, dataset).map(option => {
                                return {value: option.value, text: option.label};
                            })}
                            onChange={value => updateOption(datasetId, "degree", parseInt(value))}
                            value={option.degree}
                        />
                    </td>
                ) : null}
                {hasAdverseDirection ? (
                    <td>
                        <SelectInput
                            choices={adverseDirectionOptions.map(option => {
                                return {value: option.value, text: option.label};
                            })}
                            onChange={value =>
                                updateOption(datasetId, "adverse_direction", parseInt(value))
                            }
                            value={option.adverse_direction}
                        />
                    </td>
                ) : null}
            </tr>
        ) : (
            <tr>
                <td>{checkOrEmpty(option.enabled)}</td>
                <td>{dataset.metadata.name}</td>
                {option.degree !== undefined ? (
                    <td>{getDegreeText(dtype, option.degree)}</td>
                ) : null}
                {hasAdverseDirection ? (
                    <td>{getLabel(option.adverse_direction, adverseDirectionOptions)}</td>
                ) : null}
            </tr>
        );
    }
}

DatasetModelOption.propTypes = {
    datasetId: PropTypes.number.isRequired,
    store: PropTypes.object,
};
export default DatasetModelOption;
