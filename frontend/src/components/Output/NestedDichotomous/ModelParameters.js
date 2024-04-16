import _ from "lodash";
import {observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";

import Table from "@/components/common/Table";

@observer
class ModelParameters extends Component {
    render() {
        const {model} = this.props,
            names = model.results.parameter_names,
            values = model.results.parameters,
            data = {
                headers: ["Variable", "Estimate"],
                rows: _.range(_.size(names)).map(i => [names[i], values[i]]),
                subheader: "Model Parameters",
            };

        return <Table data={data} />;
    }
}
ModelParameters.propTypes = {
    model: PropTypes.object,
};

export default ModelParameters;
