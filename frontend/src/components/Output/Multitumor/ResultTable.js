import _ from "lodash";
import {inject, observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";

import FloatingPointHover from "@/components/common/FloatingPointHover";
import {ff} from "@/utils/formatters";

@inject("outputStore")
@observer
class ResultTable extends Component {
    render() {
        const store = this.props.outputStore;
        const {selectedFrequentist} = store;

        if (!selectedFrequentist) {
            return null;
        }
        const colWidths = [15, 15, 8, 8, 8, 8, 8, 8, 11, 11];
        const {results} = selectedFrequentist;
        const {multitumorDatasets} = store;
        const indexes = results.selected_model_indexes;
        const showMultitumor = store.multitumorDatasets.length > 1;

        return (
            <table className="table table-sm text-right col-l-1 col-l-2">
                <colgroup>
                    {_.map(colWidths).map((value, idx) => (
                        <col key={idx} width={`${value}%`} />
                    ))}
                </colgroup>
                <thead>
                    <tr className="bg-custom">
                        <th>Model</th>
                        <th>Dataset</th>
                        <th>BMDL</th>
                        <th>BMD</th>
                        <th>BMDU</th>
                        <th>CSF</th>
                        <th>
                            <i>P</i>-Value
                        </th>
                        <th>AIC</th>
                        <th>Scaled Residual at Control</th>
                        <th>Scaled Residual near BMD</th>
                    </tr>
                </thead>
                <tbody>
                    {showMultitumor ? (
                        <tr key={-1}>
                            <td>
                                <a
                                    id={`freq-result-${-1}`}
                                    href="#"
                                    onClick={e => {
                                        e.preventDefault();
                                        store.showModalDetailMultitumor(-1, -1);
                                    }}>
                                    Multitumor
                                </a>
                            </td>
                            <td>-</td>
                            <td>
                                <FloatingPointHover value={results.bmdl} />
                            </td>
                            <td>
                                <FloatingPointHover value={results.bmd} />
                            </td>
                            <td>
                                <FloatingPointHover value={results.bmdu} />
                            </td>
                            <td>
                                <FloatingPointHover value={results.slope_factor} />
                            </td>
                            <td>-</td>
                            <td>-</td>
                            <td>-</td>
                            <td>-</td>
                        </tr>
                    ) : null}
                    {results.models.map((dataset_models, dataset_index) => {
                        const dataset = multitumorDatasets[dataset_index];
                        const rows = _.flatten(
                            dataset_models.map((model, model_index) => {
                                const key = `${dataset_index}-${model_index}`;
                                const selected = indexes[dataset_index] === model_index;
                                const {results} = model;
                                return (
                                    <tr key={key} className={selected ? "table-info" : ""}>
                                        <td>
                                            <a
                                                id={key}
                                                href="#"
                                                onClick={e => {
                                                    e.preventDefault();
                                                    store.showModalDetailMultitumor(
                                                        dataset_index,
                                                        model_index
                                                    );
                                                }}>
                                                {model.name}
                                                {selected ? "*" : ""}
                                            </a>
                                        </td>
                                        <td>{dataset.metadata.name}</td>
                                        <td>
                                            <FloatingPointHover value={results.bmdl} />
                                        </td>
                                        <td>
                                            <FloatingPointHover value={results.bmd} />
                                        </td>
                                        <td>
                                            <FloatingPointHover value={results.bmdu} />
                                        </td>
                                        <td>
                                            <FloatingPointHover value={results.slope_factor} />
                                        </td>
                                        <td>{ff(results.gof.p_value)}</td>
                                        <td>
                                            <FloatingPointHover value={results.fit.aic} />
                                        </td>
                                        <td>{ff(results.gof.residual[0])}</td>
                                        <td>{ff(results.gof.roi)}</td>
                                    </tr>
                                );
                            })
                        );
                        return rows;
                    })}
                </tbody>
                <tfoot>
                    <tr>
                        <td colSpan={8} className="text-muted">
                            {
                                <ul className="list-unstyled text-muted mb-0">
                                    <li>
                                        {showMultitumor
                                            ? "* Selected model is included in MS Combo model."
                                            : "* Recommended best fitting model."}
                                    </li>
                                </ul>
                            }
                        </td>
                    </tr>
                </tfoot>
            </table>
        );
    }
}
ResultTable.propTypes = {
    outputStore: PropTypes.object,
};

export default ResultTable;
