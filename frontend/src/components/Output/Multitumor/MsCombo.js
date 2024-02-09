import {observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";

import {getLabel} from "@/common";
import TwoColumnTable from "@/components/common/TwoColumnTable";
import {dichotomousBmrOptions} from "@/constants/optionsConstants";
import {ff} from "@/utils/formatters";

@observer
class MsComboInfo extends Component {
    render() {
        const {options} = this.props,
            label = "Settings",
            data = [
                ["Model", "Multitumor"],
                ["Risk Type", getLabel(options.bmr_type, dichotomousBmrOptions)],
                ["BMR", ff(options.bmr_value)],
                ["Confidence Level", ff(options.confidence_level)],
            ];
        return <TwoColumnTable data={data} label={label} />;
    }
}
MsComboInfo.propTypes = {
    options: PropTypes.object.isRequired,
};

@observer
class MsComboSummary extends Component {
    render() {
        const {results} = this.props,
            label = "Summary",
            data = [
                ["BMD", ff(results.bmd)],
                ["BMDL", ff(results.bmdl)],
                ["BMDU", ff(results.bmdu)],
                ["Slope Factor", ff(results.slope_factor)],
                ["Combined Log-Likelihood", ff(results.ll)],
                ["Combined Log-Likelihood Constant", ff(results.ll_constant)],
            ];
        return <TwoColumnTable data={data} label={label} colwidths={[40, 60]} />;
    }
}
MsComboSummary.propTypes = {
    results: PropTypes.object.isRequired,
};

export {MsComboInfo, MsComboSummary};
