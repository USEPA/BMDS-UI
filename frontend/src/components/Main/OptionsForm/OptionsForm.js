import PropTypes from "prop-types";
import React from "react";

import * as mc from "@/constants/mainConstants";
import {
    continuousBmrOptions,
    dichotomousBmrOptions,
    distTypeOptions,
    litterSpecificCovariateOptions,
} from "@/constants/optionsConstants";

import Button from "../../common/Button";
import CheckboxInput from "../../common/CheckboxInput";
import FloatInput from "../../common/FloatInput";
import IntegerInput from "../../common/IntegerInput";
import SelectInput from "../../common/SelectInput";

const OptionsForm = props => {
    return (
        <tr className="form-group">
            <td>{props.idx + 1}</td>
            {props.modelType === mc.MODEL_CONTINUOUS ? (
                <td>
                    <SelectInput
                        choices={continuousBmrOptions.map(option => {
                            return {value: option.value, text: option.label};
                        })}
                        onChange={value =>
                            props.saveOptions("bmr_type", Number.parseInt(value), props.idx)
                        }
                        value={props.options.bmr_type}
                    />
                </td>
            ) : null}
            {props.modelType === mc.MODEL_DICHOTOMOUS ||
            props.modelType === mc.MODEL_NESTED_DICHOTOMOUS ||
            props.modelType === mc.MODEL_MULTI_TUMOR ? (
                <td>
                    <SelectInput
                        choices={dichotomousBmrOptions.map(option => {
                            return {value: option.value, text: option.label};
                        })}
                        onChange={value =>
                            props.saveOptions("bmr_type", Number.parseInt(value), props.idx)
                        }
                        value={props.options.bmr_type}
                    />
                </td>
            ) : null}

            <td>
                <FloatInput
                    onChange={value => props.saveOptions("bmr_value", value, props.idx)}
                    value={props.options.bmr_value}
                />
            </td>
            {props.modelType === mc.MODEL_CONTINUOUS ? (
                <td>
                    <FloatInput
                        value={props.options.tail_probability}
                        onChange={value => props.saveOptions("tail_probability", value, props.idx)}
                    />
                </td>
            ) : null}
            <td>
                <FloatInput
                    value={props.options.confidence_level}
                    onChange={value => props.saveOptions("confidence_level", value, props.idx)}
                />
            </td>
            {props.modelType === mc.MODEL_CONTINUOUS ? (
                <td>
                    <SelectInput
                        choices={distTypeOptions.map(option => {
                            return {value: option.value, text: option.label};
                        })}
                        onChange={value =>
                            props.saveOptions("dist_type", Number.parseInt(value), props.idx)
                        }
                        value={props.options.dist_type}
                    />
                </td>
            ) : null}
            {props.modelType === mc.MODEL_NESTED_DICHOTOMOUS ? (
                <>
                    <td>
                        <SelectInput
                            value={props.options.litter_specific_covariate}
                            onChange={value =>
                                props.saveOptions(
                                    "litter_specific_covariate",
                                    Number.parseInt(value),
                                    props.idx
                                )
                            }
                            choices={litterSpecificCovariateOptions
                                .filter(d => d.value > 0)
                                .map(option => {
                                    return {value: option.value, text: option.label};
                                })}
                        />
                    </td>
                    <td>
                        <CheckboxInput
                            checked={props.options.estimate_background}
                            onChange={value =>
                                props.saveOptions("estimate_background", value, props.idx)
                            }
                        />
                    </td>
                    <td>
                        <IntegerInput
                            value={props.options.bootstrap_iterations}
                            onChange={value =>
                                props.saveOptions("bootstrap_iterations", value, props.idx)
                            }
                        />
                    </td>
                    <td>
                        <IntegerInput
                            value={props.options.bootstrap_seed}
                            onChange={value =>
                                props.saveOptions("bootstrap_seed", value, props.idx)
                            }
                        />
                    </td>
                </>
            ) : null}
            <td>
                <Button
                    className="btn btn-danger"
                    title="Delete Option Set"
                    onClick={_e => props.deleteOptions(props.idx)}
                    icon="trash3-fill"
                />
            </td>
        </tr>
    );
};

OptionsForm.propTypes = {
    optionsStore: PropTypes.string,
    idx: PropTypes.number.isRequired,
    modelType: PropTypes.string.isRequired,
    onChange: PropTypes.func,
    saveOptions: PropTypes.func.isRequired,
    deleteOptions: PropTypes.func.isRequired,
    options: PropTypes.object.isRequired,
    bmr_value: PropTypes.number,
    tail_probability: PropTypes.number,
    distribution: PropTypes.string,
    variance: PropTypes.string,
    delete: PropTypes.func,
};
export default OptionsForm;
