import _ from "lodash";
import {inject, observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";

const getData = datasets => {
    const headers = ["Dose"],
        rows = [],
        doses = new Set();

    datasets.forEach(dataset => {
        headers.push(dataset.metadata.name);
        dataset.doses.forEach(dose => doses.add(dose));
    });

    const doseArr = [...doses].sort((a, b) => a - b);
    doseArr.forEach(dose => {
        const thisRow = [dose];
        rows.push(thisRow);
        datasets.forEach(dataset => {
            const idx = _.findIndex(dataset.doses, d => d == dose);
            if (idx >= 0) {
                thisRow.push(`${dataset.incidences[idx]}/${dataset.ns[idx]}`);
            } else {
                thisRow.push("-");
            }
        });
    });
    return {
        headers,
        colWidths: _.fill(Array(headers.length), `${Math.round(100 / headers.length)}%`),
        rows,
    };
};

@inject("outputStore")
@observer
class DatasetTable extends Component {
    render() {
        const store = this.props.outputStore,
            {selectedFrequentist} = store;

        if (!selectedFrequentist) {
            return null;
        }
        const {multitumorDatasets} = store,
            data = getData(multitumorDatasets);

        return (
            <table className="table table-sm">
                <colgroup>
                    {_.map(data.colWidths).map((value, idx) => (
                        <col key={idx} width={value}></col>
                    ))}
                </colgroup>
                <thead className="table-bordered">
                    <tr className="bg-custom">
                        {data.headers.map((text, idx) => (
                            <th key={idx}>{text}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className="table-bordered">
                    {data.rows.map((rows, idx) => (
                        <tr key={idx}>
                            {rows.map((text, idx) => (
                                <td key={idx}>{text}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    }
}
DatasetTable.propTypes = {
    outputStore: PropTypes.object,
};

export default DatasetTable;
