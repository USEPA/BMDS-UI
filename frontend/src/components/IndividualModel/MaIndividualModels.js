import {observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";

import FloatingPointHover from "@/components/common/FloatingPointHover";
import {ff} from "@/utils/formatters";

@observer
class MaIndividualModels extends Component {
    render() {
        const {model_average, models} = this.props;
        return (
            <table className="table table-sm table-bordered text-right col-l-1">
                <colgroup>
                    <col width="25%" />
                    <col width="15%" />
                    <col width="15%" />
                    <col width="15%" />
                    <col width="15%" />
                    <col width="15%" />
                </colgroup>
                <thead>
                    <tr className="bg-custom">
                        <th colSpan="6">Individual Model Results</th>
                    </tr>
                    <tr>
                        <th>Model</th>
                        <th>Prior Weights</th>
                        <th>Posterior Probability</th>
                        <th>BMDL</th>
                        <th>BMD</th>
                        <th>BMDU</th>
                    </tr>
                </thead>
                <tbody>
                    {models.map((model, i) => {
                        return (
                            <tr key={i}>
                                <td>{model.name}</td>
                                <td>{ff(model_average.results.priors[i])}</td>
                                <td>{ff(model_average.results.posteriors[i])}</td>
                                <td>
                                    <FloatingPointHover value={model.results.bmdl} />
                                </td>
                                <td>
                                    <FloatingPointHover value={model.results.bmd} />
                                </td>
                                <td>
                                    <FloatingPointHover value={model.results.bmd} />
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        );
    }
}
MaIndividualModels.propTypes = {
    model_average: PropTypes.object.isRequired,
    models: PropTypes.array.isRequired,
};
export default MaIndividualModels;
