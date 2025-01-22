import {observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";

import Table from "@/components/common/Table";
import {ff} from "@/utils/formatters";

@observer
class ParameterPriorTable extends Component {
    render() {
        // TODO - improve; this doesn't show overrides or true # of parameters
        const {priors} = this.props.model.settings.priors;
        return (
            <Table
                data={{
                    headers: ["Name", "Initial Value", "Min Value", "Max Value"],
                    rows: priors.map(d => [
                        d.name,
                        ff(d.initial_value),
                        ff(d.min_value),
                        ff(d.max_value),
                    ]),
                    tblClasses: "table table-sm text-right col-l-1",
                    subheader: "Parameter Settings",
                }}
            />
        );
    }
}

ParameterPriorTable.propTypes = {
    model: PropTypes.object.isRequired,
};
export default ParameterPriorTable;
