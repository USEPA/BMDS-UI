import _ from "lodash";
import {observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";

import {checkOrEmpty} from "@/common";
import {BIN_NAMES, logicBinOptions, ruleLookups} from "@/constants/logicConstants";
import {
    MODEL_CONTINUOUS,
    MODEL_DICHOTOMOUS,
    MODEL_NESTED_DICHOTOMOUS,
} from "@/constants/mainConstants";

import CheckboxInput from "../common/CheckboxInput";
import FloatInput from "../common/FloatInput";
import SelectInput from "../common/SelectInput";

const fieldMap = {
    [MODEL_CONTINUOUS]: "enabled_continuous",
    [MODEL_DICHOTOMOUS]: "enabled_dichotomous",
    [MODEL_NESTED_DICHOTOMOUS]: "enabled_nested",
};
const lookupMap = {
    [MODEL_CONTINUOUS]: "enabledContinuous",
    [MODEL_DICHOTOMOUS]: "enabledDichotomous",
    [MODEL_NESTED_DICHOTOMOUS]: "enabledNested",
};

@observer
class RuleRow extends Component {
    render() {
        const {rule, ruleIndex, canEdit, updateRule, modelType} = this.props;
        const ruleLookup = ruleLookups[rule.rule_class];
        const renderCheckbox = attribute => {
            return (
                <CheckboxInput
                    checked={rule[attribute]}
                    onChange={value => updateRule(ruleIndex, attribute, value)}
                />
            );
        };
        const field = fieldMap[modelType];
        const enabled = ruleLookup[lookupMap[modelType]];

        if (!enabled) {
            return null;
        }

        return canEdit ? (
            <tr>
                <td>{ruleLookup.name}</td>
                <td>{enabled ? renderCheckbox(field) : "-"}</td>
                <td>
                    {ruleLookup.hasThreshold ? (
                        <FloatInput
                            value={rule.threshold}
                            onChange={value => updateRule(ruleIndex, "threshold", value)}
                        />
                    ) : (
                        "N/A"
                    )}
                </td>
                <td>
                    <SelectInput
                        choices={logicBinOptions.map(option => {
                            return {value: option.value, text: option.label};
                        })}
                        onChange={value =>
                            updateRule(ruleIndex, "failure_bin", Number.parseInt(value))
                        }
                        value={rule.failure_bin}
                    />
                </td>
                <td dangerouslySetInnerHTML={{__html: ruleLookup.notes(rule.threshold)}} />
            </tr>
        ) : (
            <tr>
                <td>{ruleLookup.name}</td>
                <td className="text-center">{checkOrEmpty(rule[field])}</td>
                <td className="text-center">{_.isNumber(rule.threshold) ? rule.threshold : "-"}</td>
                <td>{BIN_NAMES[rule.failure_bin]}</td>
                <td dangerouslySetInnerHTML={{__html: ruleLookup.notes(rule.threshold)}} />
            </tr>
        );
    }
}

RuleRow.propTypes = {
    rule: PropTypes.object.isRequired,
    ruleIndex: PropTypes.number.isRequired,
    canEdit: PropTypes.bool.isRequired,
    updateRule: PropTypes.func.isRequired,
    modelType: PropTypes.string.isRequired,
};

export default RuleRow;
