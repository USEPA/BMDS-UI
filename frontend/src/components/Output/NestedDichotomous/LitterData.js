import _ from "lodash";
import {observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";

import Table from "@/components/common/Table";
import {ff} from "@/utils/formatters";

const getData = function (model) {
    const litter = model.results.litter,
        n = _.size(litter.lsc);
    return {
        tblClasses: "table table-sm text-right",
        headers: [
            "Dose",
            "Litter Specific Covariance",
            "Estimated Probability",
            "Litter Size",
            "Expected",
            "Observed",
            "Scaled Residual",
        ],
        colWidths: [14, 15, 14, 14, 14, 14, 15],
        subheader: "Litter Data",
        rows: _.range(n).map(i => [
            litter.dose[i],
            litter.lsc[i],
            ff(litter.estimated_probabilities[i]),
            litter.litter_size[i],
            ff(litter.expected[i]),
            litter.observed[i],
            ff(litter.scaled_residuals[i]),
        ]),
    };
};

@observer
class LitterData extends Component {
    render() {
        return <Table data={getData(this.props.model)} />;
    }
}
LitterData.propTypes = {
    model: PropTypes.object,
};

export default LitterData;
