import _ from "lodash";
import {inject, observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";

import {maIndex, modelClasses} from "@/constants/outputConstants";
import {ff, fractionalFormatter} from "@/utils/formatters";

@inject("outputStore")
@observer
class BayesianResultTable extends Component {
    render() {
        const store = this.props.outputStore,
            {selectedBayesian} = store;

        if (!selectedBayesian) {
            return null;
        }

        const colWidths = [12, 11, 11, 11, 11, 11, 11, 11, 11],
            ma = selectedBayesian.model_average;

        return (
            <table id="bayesian-model-result" className="table table-sm text-right col-l-1">
                <colgroup>
                    {_.map(colWidths).map((value, idx) => (
                        <col key={idx} width={`${value}%`}></col>
                    ))}
                </colgroup>
                <thead className="table-bordered">
                    <tr className="bg-custom">
                        <th>Model</th>
                        <th>Prior Weights</th>
                        <th>Posterior Weights</th>
                        <th>BMDL</th>
                        <th>BMD</th>
                        <th>BMDU</th>
                        <th>Unnormalized Log Posterior Probability</th>
                        <th>Scaled Residual at Control</th>
                        <th>Scaled Residual near BMD</th>
                    </tr>
                </thead>
                <tbody className="table-bordered">
                    {selectedBayesian.models.map((model, index) => {
                        return (
                            <tr key={index}>
                                <td>
                                    <a
                                        id={`bayesian-result-${index}`}
                                        href="#"
                                        onClick={e => {
                                            e.preventDefault();
                                            store.showModalDetail(modelClasses.bayesian, index);
                                        }}>
                                        {model.name}
                                    </a>
                                </td>
                                <td>{ma ? fractionalFormatter(ma.results.priors[index]) : "-"}</td>
                                <td>
                                    {ma ? fractionalFormatter(ma.results.posteriors[index]) : "-"}
                                </td>
                                <td>{ff(model.results.bmdl)}</td>
                                <td>{ff(model.results.bmd)}</td>
                                <td>{ff(model.results.bmdu)}</td>
                                <td>{ff(model.results.fit.bic_equiv)}</td>
                                <td>{ff(model.results.gof.residual[0])}</td>
                                <td>{ff(model.results.gof.roi)}</td>
                            </tr>
                        );
                    })}
                    {ma ? (
                        <tr className="table-warning">
                            <td>
                                <a
                                    id={`bayesian-result-ma`}
                                    href="#"
                                    onClick={e => {
                                        e.preventDefault();
                                        store.showModalDetail(modelClasses.bayesian, maIndex);
                                    }}>
                                    Model Average
                                </a>
                            </td>
                            <td>-</td>
                            <td>-</td>
                            <td>{ff(ma.results.bmdl)}</td>
                            <td>{ff(ma.results.bmd)}</td>
                            <td>{ff(ma.results.bmdu)}</td>
                            <td>-</td>
                            <td>-</td>
                            <td>-</td>
                        </tr>
                    ) : null}
                </tbody>
            </table>
        );
    }
}
BayesianResultTable.propTypes = {
    outputStore: PropTypes.object,
};

export default BayesianResultTable;
