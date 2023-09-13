import {inject, observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";

@inject("outputStore")
@observer
class InfoTable extends Component {
    render() {
        const {outputStore} = this.props,
            model = outputStore.modalModel,
            isSummary = outputStore.drModelModalIsMA,
            dataset = outputStore.modalDataset;

        return (
            <table id="info-table" className="table table-sm table-bordered">
                <thead>
                    <tr className="bg-custom">
                        <th colSpan="2">Info</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Dataset</td>
                        {isSummary ? <td>Summary</td> : <td>{dataset.metadata.name}</td>}
                    </tr>
                    <tr>
                        <td>Model</td>
                        <td>{model.name}</td>
                    </tr>
                    <tr>
                        <td>Equation</td>
                        <td></td>
                    </tr>
                </tbody>
            </table>
        );
    }
}
InfoTable.propTypes = {
    outputStore: PropTypes.object,
};
export default InfoTable;
