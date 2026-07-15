import _ from "lodash";
import {inject, observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";

import FloatingPointHover from "@/components/common/FloatingPointHover";
import {maIndex, modelClasses} from "@/constants/outputConstants";
import {ff, fractionalFormatter} from "@/utils/formatters";

@inject("outputStore")
@observer
class ToxicRBayesianResultTable extends Component {
    render() {
        const store = this.props.outputStore,
            {selectedToxicRBayesian} = store;

        if (!selectedToxicRBayesian) {
            return null;
        }

        const colWidths = [12, 11, 11, 11, 11, 11, 11, 11, 11],
            ma = selectedToxicRBayesian.model_average;

        return (
            <table id="toxicr-bayesian-model-result" className="table table-sm text-right col-l-1">
                <colgroup>
                    {_.map(colWidths).map((value, idx) => (
                        <col key={idx} width={`${value}%`}></col>
                    ))}
                </colgroup>
                <thead>
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
                <tbody>
                    {selectedToxicRBayesian.models.map((model, index) => {
                        return (
                            <tr key={index}>
                                <td>
                                    <a
                                        id={`toxicr-bayesian-result-${index}`}
                                        href="#"
                                        onClick={e => {
                                            e.preventDefault();
                                            store.showModalDetail(
                                                modelClasses.toxicr_bayesian,
                                                index
                                            );
                                        }}>
                                        {model.name}
                                    </a>
                                </td>
                                <td>{ma ? fractionalFormatter(ma.results.priors[index]) : "-"}</td>
                                <td>
                                    {ma ? fractionalFormatter(ma.results.posteriors[index]) : "-"}
                                </td>
                                <td>
                                    <FloatingPointHover value={model.results.bmdl} />
                                </td>
                                <td>
                                    <FloatingPointHover value={model.results.bmd} />
                                </td>
                                <td>
                                    <FloatingPointHover value={model.results.bmdu} />
                                </td>
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
                                    id={`toxicr-bayesian-result-ma`}
                                    href="#"
                                    onClick={e => {
                                        e.preventDefault();
                                        store.showModalDetail(
                                            modelClasses.toxicr_bayesian,
                                            maIndex
                                        );
                                    }}>
                                    Model Average
                                </a>
                            </td>
                            <td>-</td>
                            <td>-</td>
                            <td>
                                <FloatingPointHover value={ma.results.bmdl} />
                            </td>
                            <td>
                                <FloatingPointHover value={ma.results.bmd} />
                            </td>
                            <td>
                                <FloatingPointHover value={ma.results.bmdu} />
                            </td>
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
ToxicRBayesianResultTable.propTypes = {
    outputStore: PropTypes.object,
};

export default ToxicRBayesianResultTable;
