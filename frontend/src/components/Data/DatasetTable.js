import _ from "lodash";
import {observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";

import {columnHeaders, columns} from "@/constants/dataConstants";
import {Dtype} from "@/constants/dataConstants";

const dataRows = (dataset, columnNames) => {
        return _.range(dataset.doses.length).map(rowIdx => {
            return (
                <tr key={rowIdx}>
                    {columnNames.map((column, colIdx) => {
                        return <td key={colIdx}>{dataset[column][rowIdx]}</td>;
                    })}
                </tr>
            );
        });
    },
    individualDataRows = dataset => {
        const data = _.chain(_.zip(dataset.doses, dataset.responses))
                .map(data => {
                    return {dose: data[0], response: data[1]};
                })
                .value(),
            doses = _.uniq(dataset.doses),
            responses = doses.map(dose => {
                return _.filter(data, resp => resp.dose === dose)
                    .map(d => d.response.toString())
                    .join(", ");
            }),
            rows = _.zip(doses, responses);

        return rows.map((row, i) => {
            return (
                <tr key={i}>
                    <td>{row[0]}</td>
                    <td>{row[1]}</td>
                </tr>
            );
        });
    };

@observer
class DatasetTable extends Component {
    render() {
        const {dataset} = this.props,
            columnNames = columns[dataset.dtype],
            width = `${100 / columnNames.length}%`,
            isIndividual = dataset.dtype === Dtype.CONTINUOUS_INDIVIDUAL,
            nRows = dataset.doses.length,
            divStyle =
                !isIndividual && nRows > 10
                    ? {height: "50vh", overflowY: "auto", resize: "vertical"}
                    : {};

        return (
            <>
                <div className="label">
                    <label>Dataset Name:&nbsp;</label>
                    {dataset.metadata.name}
                </div>
                <div style={divStyle}>
                    <table className="table table-sm table-bordered text-right">
                        <colgroup>
                            {columnNames.map((d, i) => (
                                <col key={i} width={width} />
                            ))}
                        </colgroup>
                        <thead className="bg-custom">
                            <tr>
                                {columnNames.map((column, i) => (
                                    <th key={i}>{columnHeaders[column]}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {isIndividual
                                ? individualDataRows(dataset)
                                : dataRows(dataset, columnNames)}
                        </tbody>
                    </table>
                </div>
            </>
        );
    }
}
DatasetTable.propTypes = {
    dataset: PropTypes.object.isRequired,
};
export default DatasetTable;
