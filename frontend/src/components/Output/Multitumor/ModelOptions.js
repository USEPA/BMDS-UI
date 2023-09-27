import {inject, observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";

import {getLabel} from "@/common";
import TwoColumnTable from "@/components/common/TwoColumnTable";
import {dichotomousBmrOptions} from "@/constants/optionsConstants";
import {ff} from "@/utils/formatters";

@inject("outputStore")
@observer
class ModelOptions extends Component {
    render() {
        const {outputStore} = this.props,
            options = outputStore.selectedModelOptions,
            {modalOptionSet} = outputStore,
            degree = modalOptionSet.degree == 0 ? "auto" : modalOptionSet.degree,
            data = [
                ["Risk Type", getLabel(options.bmr_type, dichotomousBmrOptions)],
                ["BMR", ff(options.bmr_value)],
                ["Confidence Level", ff(options.confidence_level)],
                ["Degree", degree],
            ];
        return <TwoColumnTable data={data} label="Model Options" />;
    }
}
ModelOptions.propTypes = {
    outputStore: PropTypes.object,
};
export default ModelOptions;
