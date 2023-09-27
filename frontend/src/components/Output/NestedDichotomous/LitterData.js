import _ from "lodash";
import {observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";

import {ff} from "@/utils/formatters";

@observer
class LitterData extends Component {
    render() {
        const litter = this.props.model.results.litter,
            n = _.size(litter.lsc);
        return (
            <table className="table table-sm table-bordered">
                <colgroup>
                    <col width="14%" />
                    <col width="15%" />
                    <col width="14%" />
                    <col width="14%" />
                    <col width="14%" />
                    <col width="14%" />
                    <col width="15%" />
                </colgroup>
                <thead>
                    <tr className="bg-custom">
                        <th colSpan="7">Litter Data</th>
                    </tr>
                    <tr>
                        <th>Dose</th>
                        <th>Litter Specific Covariance</th>
                        <th>Estimated Probability</th>
                        <th>Liter Size</th>
                        <th>Expected</th>
                        <th>Observed</th>
                        <th>Scaled Residual</th>
                    </tr>
                </thead>
                <tbody>
                    {_.range(n).map(i => {
                        return (
                            <tr key={i}>
                                <td>{litter.dose[i]}</td>
                                <td>{litter.lsc[i]}</td>
                                <td>{ff(litter.estimated_probabilities[i])}</td>
                                <td>{litter.litter_size[i]}</td>
                                <td>{ff(litter.expected[i])}</td>
                                <td>{litter.observed[i]}</td>
                                <td>{ff(litter.scaled_residuals[i])}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        );
    }
}
LitterData.propTypes = {
    model: PropTypes.object,
};

export default LitterData;
