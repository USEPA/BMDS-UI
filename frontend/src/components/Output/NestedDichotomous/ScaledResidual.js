import {observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";

@observer
class ScaledResidual extends Component {
    render() {
        return (
            <table id="info-table" className="table table-sm table-bordered">
                <thead>
                    <tr className="bg-custom">
                        <th colSpan="2" className="text-center">
                            Scaled Residuals
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Minimum scaled residual for dose group nearest the BMD</td>
                        <td>{this.props.model.results.scaled_residuals[0]}</td>
                    </tr>
                    <tr>
                        <td>Minimum ABS(scaled residual) for dose group nearest the BMD</td>
                        <td>{this.props.model.results.scaled_residuals[1]}</td>
                    </tr>
                    <tr>
                        <td>Average Scaled residual for dose group nearest the BMD</td>
                        <td>{this.props.model.results.scaled_residuals[2]}</td>
                    </tr>
                    <tr>
                        <td>Average ABS(scaled residual) for dose group nearest the BMD</td>
                        <td>{this.props.model.results.scaled_residuals[3]}</td>
                    </tr>
                    <tr>
                        <td>Maximum scaled residual for dose group nearest the BMD</td>
                        <td>{this.props.model.results.scaled_residuals[4]}</td>
                    </tr>
                    <tr>
                        <td>Maximum ABS(scaled residual) for dose group nearest the BMD</td>
                        <td>{this.props.model.results.scaled_residuals[5]}</td>
                    </tr>
                </tbody>
            </table>
        );
    }
}
ScaledResidual.propTypes = {
    model: PropTypes.object,
};

export default ScaledResidual;
