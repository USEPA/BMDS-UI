import {inject, observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";

import {columnHeaders, columns} from "@/constants/dataConstants";
import {MODEL_DICHOTOMOUS, MODEL_MULTI_TUMOR} from "@/constants/mainConstants";

import Button from "../common/Button";
import ErrorMessage from "../common/ErrorMessage";
import FloatInput from "../common/FloatInput";
import Icon from "../common/Icon";
import TextInput from "../common/TextInput";
import TabularDatasetModal from "./TabularDatasetModal";

const DatasetFormRow = props => {
    return (
        <tr>
            {props.columns.map((column, index) => {
                return (
                    <td key={index}>
                        <FloatInput
                            value={props.row[column]}
                            onChange={value => props.onChange(column, value, props.rowIdx)}
                        />
                    </td>
                );
            })}
            <td>
                <Button
                    className="btn btn-danger btn-sm"
                    onClick={e => props.delete(props.rowIdx)}
                    icon="trash3-fill"
                />
            </td>
        </tr>
    );
};
DatasetFormRow.propTypes = {
    columns: PropTypes.array.isRequired,
    row: PropTypes.object,
    onChange: PropTypes.func,
    rowIdx: PropTypes.number,
    delete: PropTypes.func,
};

@inject("dataStore")
@observer
class DatasetForm extends Component {
    render() {
        const {dataStore} = this.props,
            dataset = dataStore.selectedDataset,
            errorText = dataStore.selectedDatasetErrorText,
            columnNames = columns[dataset.dtype];

        return (
            <div className="container-fluid">
                <div className="form-group row mx-0">
                    <label htmlFor="datasetName" className="col-md-3 px-0">
                        Dataset name
                    </label>
                    <div className="input-group col-md-9">
                        <TextInput
                            value={dataset.metadata.name}
                            onChange={value => dataStore.setDatasetMetadata("name", value)}
                        />

                        <div className="input-group-append">
                            <Button
                                className="btn btn-danger btn-sm float-right ml-1"
                                onClick={dataStore.deleteDataset}
                                text="Delete"
                                icon="trash3-fill"
                            />
                        </div>
                    </div>
                </div>
                <div className="form-group row mx-0">
                    <label htmlFor="doseName" className="col-md-2 px-0">
                        Dose name
                    </label>
                    <div className="col-md-4">
                        <TextInput
                            value={dataset.metadata.dose_name}
                            onChange={value => dataStore.setDatasetMetadata("dose_name", value)}
                        />
                    </div>
                    <label htmlFor="responseName" className="col-md-2 px-0">
                        Response name
                    </label>
                    <div className="col-md-4">
                        <TextInput
                            value={dataset.metadata.response_name}
                            onChange={value => dataStore.setDatasetMetadata("response_name", value)}
                        />
                    </div>
                </div>
                <div className="form-group row mx-0">
                    <label htmlFor="doseUnits" className="col-md-2 px-0">
                        Dose units
                    </label>
                    <div className="col-md-4">
                        <TextInput
                            value={dataset.metadata.dose_units}
                            onChange={value => dataStore.setDatasetMetadata("dose_units", value)}
                        />
                    </div>

                    <label htmlFor="responseUnits" className="col-md-2 px-0">
                        Response units
                    </label>
                    <div className="col-md-4">
                        <TextInput
                            value={dataset.metadata.response_units}
                            onChange={value =>
                                dataStore.setDatasetMetadata("response_units", value)
                            }
                        />
                    </div>
                </div>
                <ErrorMessage error={errorText} />
                <table className="table table-sm text-center">
                    <thead>
                        <tr className="bg-custom text-center">
                            {columnNames.map((item, index) => (
                                <th key={index}>{columnHeaders[item]}</th>
                            ))}
                            <th style={{width: 100}}>
                                <Button
                                    className="btn btn-primary"
                                    title="Add row"
                                    onClick={dataStore.addRow}
                                    icon="plus-circle"
                                />
                                &nbsp;
                                <Button
                                    className="btn btn-info"
                                    title="Load dataset from Excel"
                                    onClick={dataStore.toggleDatasetModal}
                                    icon="table"
                                />
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {dataStore.getMappedArray.map((obj, i) => {
                            return (
                                <DatasetFormRow
                                    key={i}
                                    rowIdx={i}
                                    columns={columnNames}
                                    row={obj}
                                    onChange={dataStore.saveDatasetCellItem}
                                    delete={dataStore.deleteRow}
                                />
                            );
                        })}
                    </tbody>
                </table>
                <div className="d-flex ">
                    <Button
                        className="btn btn-link"
                        onClick={dataStore.loadExampleData}
                        icon="layer-forward"
                        text="Load an example dataset"
                    />
                    {dataStore.rootStore.mainStore.model_type == MODEL_MULTI_TUMOR ? (
                        <a
                            className="ml-auto"
                            href="/transforms/polyk/"
                            target="_blank"
                            rel="noopener noreferrer">
                            <Icon name="calculator" text="Poly K Adjustment" />
                        </a>
                    ) : null}
                    {dataStore.rootStore.mainStore.model_type == MODEL_DICHOTOMOUS ? (
                        <a
                            className="ml-auto"
                            href="/transforms/rao-scott/"
                            target="_blank"
                            rel="noopener noreferrer">
                            <Icon name="calculator" text="Rao-Scott Transformation" />
                        </a>
                    ) : null}
                </div>
                <TabularDatasetModal />
            </div>
        );
    }
}
DatasetForm.propTypes = {
    dataStore: PropTypes.object,
};
export default DatasetForm;
