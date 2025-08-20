import _ from "lodash";
import {observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";

import Table from "@/components/common/Table";
import {columnHeaders, columns} from "@/constants/dataConstants";
import {Dtype} from "@/constants/dataConstants";

const dataRows = (dataset, columnNames) => {
    return _.range(dataset.doses.length).map(rowIdx => {
        return columnNames.map(column => dataset[column][rowIdx]);
    });
};
const individualDataRows = dataset => {
    const data = _.chain(_.zip(dataset.doses, dataset.responses))
        .map(data => {
            return {dose: data[0], response: data[1]};
        })
        .value();
    const doses = _.uniq(dataset.doses);
    const responses = doses.map(dose => {
        return _.filter(data, resp => resp.dose === dose)
            .map(d => d.response.toString())
            .join(", ");
    });
    return _.zip(doses, responses);
};

@observer
class DatasetTable extends Component {
    render() {
        const {dataset, footnotes} = this.props;
        const columnNames = columns[dataset.dtype];
        const isIndividual = dataset.dtype === Dtype.CONTINUOUS_INDIVIDUAL;
        const nRows = dataset.doses.length;
        const divStyle =
            !isIndividual && nRows > 10
                ? {height: "50vh", overflowY: "auto", resize: "vertical"}
                : {};
        const data = {
            headers: columnNames.map(d => columnHeaders[d]),
            rows: isIndividual ? individualDataRows(dataset) : dataRows(dataset, columnNames),
            tblClasses: "table table-sm text-right",
            footnotes,
        };

        return (
            <>
                <div className="label">
                    <label>Dataset Name:&nbsp;</label>
                    {dataset.metadata.name}
                </div>
                <div style={divStyle}>
                    <Table data={data} />
                </div>
            </>
        );
    }
}
DatasetTable.propTypes = {
    dataset: PropTypes.object.isRequired,
    footnotes: PropTypes.node,
};
export default DatasetTable;
