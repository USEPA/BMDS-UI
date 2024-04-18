import _ from "lodash";
import {observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";

import {getLabel} from "@/common";
import Table from "@/components/common/Table";
import {isFrequentist, priorTypeLabels} from "@/constants/outputConstants";
import {ff} from "@/utils/formatters";

const getBayesianData = parameters => {
        return {
            headers: ["Name", "Type", "Initial Value", "Std. Dev.", "Min Value", "Max Value"],
            rows: _.range(parameters.names.length).map(idx => [
                parameters.names[idx],
                getLabel(parameters.prior_type[idx], priorTypeLabels),
                ff(parameters.prior_initial_value[idx]),
                ff(parameters.prior_stdev[idx]),
                ff(parameters.prior_min_value[idx]),
                ff(parameters.prior_max_value[idx]),
            ]),
            tblClasses: "table table-sm table-bordered text-right col-l-1 col-l-2",
            subheader: "Parameter Settings",
        };
    },
    getFrequentistData = parameters => {
        return {
            headers: ["Name", "Initial Value", "Min Value", "Max Value"],
            rows: _.range(parameters.names.length).map(idx => [
                parameters.names[idx],
                ff(parameters.prior_initial_value[idx]),
                ff(parameters.prior_min_value[idx]),
                ff(parameters.prior_max_value[idx]),
            ]),
            tblClasses: "table table-sm table-bordered text-right col-l-1",
            subheader: "Parameter Settings",
        };
    };

@observer
class ParameterPriorTable extends Component {
    render() {
        const {parameters, priorClass} = this.props,
            data = isFrequentist(priorClass)
                ? getFrequentistData(parameters)
                : getBayesianData(parameters);
        return <Table data={data} />;
    }
}

ParameterPriorTable.propTypes = {
    parameters: PropTypes.object.isRequired,
    priorClass: PropTypes.number.isRequired,
};
export default ParameterPriorTable;
