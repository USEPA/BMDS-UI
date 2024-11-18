import _ from "lodash";
import {inject, observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";

import DecisionLogic from "./DecisionLogic";
import RuleTable from "./RuleTable";

@inject("logicStore")
@observer
class Logic extends Component {
    render() {
        const {logic} = this.props.logicStore;

        if (!_.isObject(logic)) {
            return (
                <div className="container-fluid">
                    <p>No recommendation logic available.</p>
                </div>
            );
        }

        return (
            <div className="container-fluid">
                <DecisionLogic />
                <h3>Model Recommendation and Bin Placement Logic</h3>
                <RuleTable />
            </div>
        );
    }
}

Logic.propTypes = {
    logicStore: PropTypes.object,
};

export default Logic;
