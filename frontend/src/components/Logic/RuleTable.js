import _ from "lodash";
import {inject, observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";

import {optionalRules, ruleOrder} from "@/constants/logicConstants";

import RuleRow from "./RuleRow";

@inject("logicStore")
@observer
class RuleList extends Component {
    render() {
        const {logicStore} = this.props,
            {canEdit, updateRule, modelType} = logicStore,
            {rules} = logicStore.logic;

        return (
            <table id="rule-table" className="table table-sm">
                <thead className="bg-custom">
                    <tr>
                        <th colSpan="5">Model Recommendation and Bin Placement Logic</th>
                    </tr>
                    <tr>
                        <th>Test Description</th>
                        <th>Enabled</th>
                        <th>Test Threshold</th>
                        <th>Bin Placement if Test is Failed</th>
                        <th>Notes to Show</th>
                    </tr>
                </thead>
                <tbody>
                    {ruleOrder.map(ruleName => {
                        const ruleIndex = _.findIndex(rules, d => d.rule_class === ruleName);
                        if (ruleIndex === -1 && _.includes(optionalRules, ruleName)) {
                            return null;
                        }
                        return (
                            <RuleRow
                                key={ruleName}
                                rule={rules[ruleIndex]}
                                ruleIndex={ruleIndex}
                                canEdit={canEdit}
                                updateRule={updateRule}
                                modelType={modelType}
                            />
                        );
                    })}
                </tbody>
            </table>
        );
    }
}

RuleList.propTypes = {
    logicStore: PropTypes.object,
};

export default RuleList;
