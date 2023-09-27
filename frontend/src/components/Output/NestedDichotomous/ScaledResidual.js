import {observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";

import TwoColumnTable from "@/components/common/TwoColumnTable";

@observer
class ScaledResidual extends Component {
    render() {
        const residuals = this.props.model.results.scaled_residuals,
            data = [
                ["Minimum scaled residual for dose group nearest the BMD", residuals[0]],
                ["Minimum ABS(scaled residual) for dose group nearest the BMD", residuals[1]],
                ["Average Scaled residual for dose group nearest the BMD", residuals[2]],
                ["Average ABS(scaled residual) for dose group nearest the BMD", residuals[3]],
                ["Maximum scaled residual for dose group nearest the BMD", residuals[4]],
                ["Maximum ABS(scaled residual) for dose group nearest the BMD", residuals[5]],
            ];
        return <TwoColumnTable label="Scaled Residuals" data={data} colwidths={[70, 30]} />;
    }
}
ScaledResidual.propTypes = {
    model: PropTypes.object,
};

export default ScaledResidual;
