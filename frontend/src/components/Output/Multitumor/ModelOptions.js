import {observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";

@observer
class ModelOptions extends Component {
    render() {
        // const {model} = this.props;
        let data = [];

        data = [
            ["BMR Type", "BMR Type"],
            ["BMR", "BMR"],
            ["Confidence Level", "confidence level"],
            ["Degree", "degree"],
        ];

        return (
            <table className="table table-sm table-bordered col-r-2">
                <thead>
                    <tr className="bg-custom">
                        <th colSpan="2">Model Options</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((d, i) => {
                        if (!d) {
                            return null;
                        }
                        return (
                            <tr key={i}>
                                <td>{d[0]}</td>
                                <td>{d[1]}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        );
    }
}
ModelOptions.propTypes = {
    model: PropTypes.object.isRequired,
};
export default ModelOptions;
