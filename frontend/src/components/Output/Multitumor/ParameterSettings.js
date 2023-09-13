import _ from "lodash";
import {observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";

@observer
class ParameterSettings extends Component {
    render() {
        const model = this.props.model.parameters,
            temp_rslt_len = _.size(model.names);
        return (
            <table className="table table-sm table-bordered">
                <thead>
                    <tr className="bg-custom">
                        <th colSpan="4">Parameter Settings</th>
                    </tr>
                    <tr>
                        <th>Parameter</th>
                        <th>Initial</th>
                        <th>Min</th>
                        <th>Max</th>
                    </tr>
                </thead>
                <tbody>
                    {_.range(temp_rslt_len).map(i => {
                        return (
                            <tr key={i}>
                                <td>{model.names[i]}</td>
                                <td>{model.prior_initial_value[i]}</td>
                                <td>{model.prior_min_value[i]}</td>
                                <td>{model.prior_max_value[i]}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        );
    }
}
ParameterSettings.propTypes = {
    model: PropTypes.object,
};

export default ParameterSettings;
