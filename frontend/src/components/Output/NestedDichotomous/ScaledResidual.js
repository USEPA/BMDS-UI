import {observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";

import TwoColumnTable from "@/components/common/TwoColumnTable";
import {ff} from "@/utils/formatters";
@observer
class ScaledResidual extends Component {
    render() {
        const residuals = this.props.model.results.scaled_residuals,
            data = [
                ["Minimum scaled residual", ff(residuals.min)],
                ["Minimum ABS(scaled residual)", ff(residuals.min_abs)],
                ["Average Scaled residual", ff(residuals.avg)],
                ["Average ABS(scaled residual)", ff(residuals.avg_abs)],
                ["Maximum scaled residual", ff(residuals.max)],
                ["Maximum ABS(scaled residual)", ff(residuals.max_abs)],
            ];
        return (
            <TwoColumnTable
                label="Scaled Residuals (for dose group nearest the BMD)"
                data={data}
                colwidths={[60, 40]}
            />
        );
    }
}
ScaledResidual.propTypes = {
    model: PropTypes.object,
};

export default ScaledResidual;
