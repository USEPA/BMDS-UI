import _ from "lodash";
import {observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";

import {ff} from "@/utils/formatters";

@observer
class LitterData extends Component {
    render() {
        const litter = this.props.model.results.litter,
            temp_rslt_len = _.size(litter.lsc);
        return (
            <table className="table table-sm table-bordered">
                <thead>
                    <tr className="bg-custom">
                        <th colSpan="7">Litter Data</th>
                    </tr>
                    <tr>
                        <th>Dose</th>
                        <th>Lit. Spec. Cov.</th>
                        <th>Est. Prob.</th>
                        <th>Liter Size</th>
                        <th>Expected</th>
                        <th>Observed</th>
                        <th>Scaled Residual</th>
                    </tr>
                </thead>
                <tbody>
                    {_.range(temp_rslt_len).map(i => {
                        return (
                            <tr key={i}>
                                <td>{litter.dose[i]}</td>
                                <td>{litter.lsc[i]}</td>
                                <td>{ff(litter.estimated_probabilities[i])}</td>
                                <td>{litter.litter_size[i]}</td>
                                <td>{ff(litter.expected[i])}</td>
                                <td>{litter.observed[i]}</td>
                                <td>{ff(litter.sr[i])}</td>
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
