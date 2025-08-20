import _ from "lodash";
import {inject, observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";

import Table from "@/components/common/Table";

const getData = datasets => {
    const headers = ["Dose"];
    const rows = [];
    const doses = new Set();

    datasets.forEach(dataset => {
        headers.push(dataset.metadata.name);
        dataset.doses.forEach(dose => doses.add(dose));
    });

    const doseArr = [...doses].sort((a, b) => a - b);
    doseArr.forEach(dose => {
        const thisRow = [dose];
        rows.push(thisRow);
        datasets.forEach(dataset => {
            const idx = _.findIndex(dataset.doses, d => d === dose);
            if (idx >= 0) {
                thisRow.push(`${dataset.incidences[idx]}/${dataset.ns[idx]}`);
            } else {
                thisRow.push("-");
            }
        });
    });
    return {tblClasses: "table table-sm text-right col-l-1", headers, rows};
};

@inject("outputStore")
@observer
class DatasetTable extends Component {
    render() {
        const store = this.props.outputStore;
        const {selectedFrequentist} = store;

        if (!selectedFrequentist) {
            return null;
        }
        return <Table data={getData(store.multitumorDatasets)} />;
    }
}
DatasetTable.propTypes = {
    outputStore: PropTypes.object,
};

export default DatasetTable;
