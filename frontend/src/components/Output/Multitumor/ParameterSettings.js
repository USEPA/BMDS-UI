import _ from "lodash";
import {observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";

@observer
class ParameterSettings extends Component {
    render() {
        const params = this.props.model.results.parameters,
            n_params = _.size(params.names);
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
                    {_.range(n_params).map(i => {
                        return (
                            <tr key={i}>
                                <td>{params.names[i]}</td>
                                <td>{params.prior_initial_value[i]}</td>
                                <td>{params.prior_min_value[i]}</td>
                                <td>{params.prior_max_value[i]}</td>
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
