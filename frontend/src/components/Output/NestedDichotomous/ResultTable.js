import _ from "lodash";
import {inject, observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";

import {modelClasses} from "@/constants/outputConstants";
import {ff} from "@/utils/formatters";

@inject("outputStore")
@observer
class ResultTable extends Component {
    render() {
        const store = this.props.outputStore,
            {selectedFrequentist} = store;

        if (!selectedFrequentist) {
            return null;
        }

        const colWidths = [15, 11, 11, 11, 11, 11, 30],
            {models} = selectedFrequentist;

        return (
            <table className="table table-sm">
                <colgroup>
                    {_.map(colWidths).map((value, idx) => (
                        <col key={idx} width={`${value}%`}></col>
                    ))}
                </colgroup>
                <thead className="table-bordered">
                    <tr className="bg-custom">
                        <th>Model</th>
                        <th>BMDL</th>
                        <th>BMD</th>
                        <th>BMDU</th>
                        <th>
                            <i>P</i>-Value
                        </th>
                        <th>AIC</th>
                        <th>Recommendation and Notes</th>
                    </tr>
                </thead>
                <tbody className="table-bordered">
                    {models.map((model, index) => (
                        <tr
                            key={index}
                            onMouseEnter={() => store.drPlotAddHover(model)}
                            onMouseLeave={store.drPlotRemoveHover}>
                            <td>
                                <a
                                    id={`freq-result-${index}`}
                                    href="#"
                                    onClick={e => {
                                        e.preventDefault();
                                        store.showModalDetail(modelClasses.frequentist, index);
                                    }}>
                                    {model.name}
                                </a>
                            </td>
                            <td>{ff(model.results.summary.bmdl)}</td>
                            <td>{ff(model.results.summary.bmd)}</td>
                            <td>{ff(model.results.summary.bmdu)}</td>
                            <td>{ff(model.results.combined_pvalue)}</td>
                            <td>{ff(model.results.summary.aic)}</td>
                            <td>TODO</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    }
}
ResultTable.propTypes = {
    outputStore: PropTypes.object,
};

export default ResultTable;
