import {inject, observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";

import TwoColumnTable from "@/components/common/TwoColumnTable";
import {getNameFromDegrees} from "@/constants/modelConstants";
@inject("outputStore")
@observer
class InfoTable extends Component {
    render() {
        const {outputStore} = this.props,
            model = outputStore.modalModel,
            // MT has a different Dataset
            dataset = outputStore.isMultitumor
                ? outputStore.modalDataset
                : outputStore.selectedDataset;
        let data;
        if (outputStore.isMultitumor) {
            data = [
                ["HERERERE", "HERERE"],
                [("Dataset", dataset.metadata.name)],
                ["Model", getNameFromDegrees(model)],
                ["Equation", "P[dose] = g + (1 - g) * (1 - exp(-b1 * dose^1 - b2 * dose^2 - ...))"],
            ];
        } else {
            data = [
                ["test", 123],
                // ["Dataset", dataset.metadata.name],
                // ["Model", model.name],
                // ["Equation", model.model_class.model_form_str],
            ];
        }
        return <TwoColumnTable id="info-table" data={data} label="Info" />;
    }
}
InfoTable.propTypes = {
    outputStore: PropTypes.object,
};
export default InfoTable;
