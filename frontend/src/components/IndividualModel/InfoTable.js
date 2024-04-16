import {inject, observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";

import TwoColumnTable from "@/components/common/TwoColumnTable";

@inject("outputStore")
@observer
class InfoTable extends Component {
    render() {
        const {outputStore} = this.props,
            model = outputStore.modalModel,
            dataset = outputStore.isMultiTumor
                ? outputStore.modalDataset
                : outputStore.selectedDataset,
            data = [
                ["Dataset", dataset.metadata.name],
                ["Model", model.name],
                ["Equation", model.model_class.model_form_str],
            ];
        return <TwoColumnTable id="info-table" data={data} label="Info" />;
    }
}
InfoTable.propTypes = {
    outputStore: PropTypes.object,
};
export default InfoTable;
