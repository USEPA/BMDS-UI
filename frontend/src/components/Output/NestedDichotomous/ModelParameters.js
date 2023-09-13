import _ from "lodash";
import {observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";

@observer
class ModelParameters extends Component {
    render() {
        const names = this.props.model.results.parameter_names,
            values = this.props.model.results.parameters;

        return (
            <table id="info-table" className="table table-sm table-bordered">
                <thead>
                    <tr className="bg-custom">
                        <th colSpan="2" className="text-center">
                            Model Parameters
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {_.range(_.size(names)).map(i => {
                        return (
                            <tr key={i}>
                                <td>{names[i]}</td>
                                <td>{values[i]}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        );
    }
}
ModelParameters.propTypes = {
    model: PropTypes.object,
};

export default ModelParameters;
