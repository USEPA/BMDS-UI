import {inject, observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";

import SelectInput from "../common/SelectInput";

@inject("dataStore")
@observer
class DatasetSelector extends Component {
    render() {
        const {dataStore, store} = this.props;
        if (dataStore.datasets.length < 2) {
            return null;
        }
        return (
            <SelectInput
                onChange={value => store.setSelectedDataset(parseInt(value))}
                label="Select existing"
                value={store.selectedDatasetId}
                choices={dataStore.datasets.map(dataset => {
                    return {value: dataset.metadata.id, text: dataset.metadata.name};
                })}
            />
        );
    }
}
DatasetSelector.propTypes = {
    dataStore: PropTypes.object,
    store: PropTypes.object,
};
export default DatasetSelector;
