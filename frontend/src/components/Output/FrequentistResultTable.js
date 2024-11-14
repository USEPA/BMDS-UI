import _ from "lodash";
import {toJS} from "mobx";
import {inject, observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";

import FloatingPointHover from "@/components/common/FloatingPointHover";
import {BIN_LABELS} from "@/constants/logicConstants";
import {getPValue, modelClasses, priorClass} from "@/constants/outputConstants";
import {fractionalFormatter} from "@/utils/formatters";
import {ff} from "@/utils/formatters";

import Button from "../common/Button";
import Popover from "../common/Popover";

const getModelBinLabel = function(output, index) {
        if (output.recommender.results.recommended_model_index == index) {
            return `Recommended - Lowest ${output.recommender.results.recommended_model_variable.toUpperCase()}`;
        }
        return BIN_LABELS[output.recommender.results.model_bin[index]];
    },
    getModelBinText = function(output, index) {
        return _.chain(toJS(output.recommender.results.model_notes[index]))
            .values()
            .flattenDeep()
            .value();
    },
    getRecommenderText = function(output, index) {
        let items = getModelBinText(output, index);
        if (items.length === 0) {
            return null;
        }
        return (
            <ul className="list-unstyled text-muted mb-0">
                {items.map((d, idx) => (
                    <li key={idx}>{d}</li>
                ))}
            </ul>
        );
    },
    getFootnotes = function(recommendedModelIndex, selected) {
        const icons = "*†‡§",
            fns = [];
        if (_.isNumber(recommendedModelIndex)) {
            fns.push({
                index: recommendedModelIndex,
                icon: icons[fns.length],
                text: "BMDS recommended best fitting model",
                class: "table-info",
            });
        }
        if (_.isNumber(selected.model_index)) {
            fns.push({
                index: selected.model_index,
                icon: icons[fns.length],
                text: selected.notes,
                class: "table-success",
            });
        }
        return fns;
    },
    getRestricted = function(models) {
        return _.chain(models)
            .map((model, index) => {
                if (model.settings.priors.prior_class === priorClass.frequentist_restricted) {
                    return {model, index};
                }
                return null;
            })
            .compact()
            .value();
    },
    getUnrestricted = function(models) {
        return _.chain(models)
            .map((model, index) => {
                if (model.settings.priors.prior_class === priorClass.frequentist_unrestricted) {
                    return {model, index};
                }
                return null;
            })
            .compact()
            .value();
    },
    getColWidths = function(store) {
        if (store.isNestedDichotomous) {
            return store.recommendationEnabled
                ? [20, 11, 11, 11, 11, 11, 25]
                : [20, 16, 16, 16, 16, 16];
        } else {
            return store.recommendationEnabled
                ? [12, 8, 8, 8, 8, 8, 10, 10, 28]
                : [20, 10, 10, 10, 10, 10, 15, 15];
        }
    },
    TableFootnotes = props => {
        const {items, colSpan} = props;
        if (items.length == 0) {
            return null;
        }
        return (
            <tfoot>
                <tr>
                    <td colSpan={colSpan} className="text-muted">
                        {
                            <ul className="list-unstyled text-muted mb-0">
                                {items.map((item, i) => (
                                    <li key={i}>
                                        {item.icon}&nbsp;{item.text}
                                    </li>
                                ))}
                            </ul>
                        }
                    </td>
                </tr>
            </tfoot>
        );
    };

TableFootnotes.propTypes = {
    items: PropTypes.array.isRequired,
    colSpan: PropTypes.number.isRequired,
};

@observer
class FrequentistRowSet extends Component {
    render() {
        const {store, dataset, selectedFrequentist, footnotes, models, label, colSpan} = this.props;
        if (models.length == 0) {
            return null;
        }
        return (
            <>
                <tr>
                    <td colSpan={colSpan} headers="m-name">
                        <b>
                            <u>{label}</u>
                        </b>
                    </td>
                </tr>
                {models.map(model => (
                    <FrequentistRow
                        key={model.index}
                        store={store}
                        dataset={dataset}
                        data={model}
                        selectedFrequentist={selectedFrequentist}
                        footnotes={footnotes}
                    />
                ))}
            </>
        );
    }
}
FrequentistRowSet.propTypes = {
    store: PropTypes.object.isRequired,
    selectedFrequentist: PropTypes.object.isRequired,
    footnotes: PropTypes.array.isRequired,
    models: PropTypes.array.isRequired,
    dataset: PropTypes.object.isRequired,
    label: PropTypes.string.isRequired,
    colSpan: PropTypes.number.isRequired,
};

class ModelNameTd extends Component {
    render() {
        const {store, data, rowIcon, modelClasses} = this.props;
        return (
            <td headers="m-name">
                <a
                    id={`freq-result-${data.index}`}
                    href="#"
                    onClick={e => {
                        e.preventDefault();
                        store.showModalDetail(modelClasses.frequentist, data.index);
                    }}>
                    {data.model.name}
                    {rowIcon}
                </a>
            </td>
        );
    }
}
ModelNameTd.propTypes = {
    store: PropTypes.object.isRequired,
    data: PropTypes.object.isRequired,
    rowIcon: PropTypes.string.isRequired,
    modelClasses: PropTypes.object.isRequired,
};

class RecommendationTd extends Component {
    render() {
        const {store, data, selectedFrequentist} = this.props;

        if (!store.recommendationEnabled) {
            return null;
        }

        const {name} = data.model,
            popoverTitle = `${name}: ${getModelBinLabel(selectedFrequentist, data.index)}`,
            popoverContent =
                getModelBinText(selectedFrequentist, data.index)
                    .toString()
                    .split(",")
                    .join("<br/>") || "<i>No notes.</i>";

        return store.showInlineNotes ? (
            <td headers="rec">
                <u>{getModelBinLabel(selectedFrequentist, data.index)}</u>
                <br />
                {getRecommenderText(selectedFrequentist, data.index)}
            </td>
        ) : (
            <Popover
                element="td"
                title={popoverTitle}
                content={popoverContent}
                attrs={{headers: "rec"}}>
                <u>{getModelBinLabel(selectedFrequentist, data.index)}</u>
            </Popover>
        );
    }
}
RecommendationTd.propTypes = {
    store: PropTypes.object.isRequired,
    data: PropTypes.object.isRequired,
    selectedFrequentist: PropTypes.object.isRequired,
};

@observer
class FrequentistRow extends Component {
    render() {
        const {store, data, dataset, selectedFrequentist, footnotes} = this.props,
            fns = footnotes.filter(d => d.index == data.index),
            rowClass = fns.length > 0 ? fns[fns.length - 1].class : "",
            rowIcon = fns.map(d => d.icon).join(""),
            {results} = data.model;

        if (store.isNestedDichotomous) {
            return (
                <tr
                    key={data.index}
                    onMouseEnter={() => store.drPlotAddHover(data.model)}
                    onMouseLeave={store.drPlotRemoveHover}
                    className={rowClass}>
                    <ModelNameTd
                        store={store}
                        data={data}
                        rowIcon={rowIcon}
                        modelClasses={modelClasses}
                    />
                    <td headers="bmdl">
                        <FloatingPointHover value={results.bmdl} />
                    </td>
                    <td headers="bmd">
                        <FloatingPointHover value={results.bmd} />
                    </td>
                    <td headers="bmdu">
                        <FloatingPointHover value={results.bmdu} />
                    </td>
                    <td headers="p_value">{ff(results.combined_pvalue)}</td>
                    <td headers="aic">
                        <FloatingPointHover value={results.aic} />
                    </td>
                    <RecommendationTd
                        store={store}
                        data={data}
                        selectedFrequentist={selectedFrequentist}
                    />
                </tr>
            );
        }
        return (
            <tr
                key={data.index}
                onMouseEnter={() => store.drPlotAddHover(data.model)}
                onMouseLeave={store.drPlotRemoveHover}
                className={rowClass}>
                <ModelNameTd
                    store={store}
                    data={data}
                    rowIcon={rowIcon}
                    modelClasses={modelClasses}
                />
                <td headers="bmdl">
                    <FloatingPointHover value={results.bmdl} />
                </td>
                <td headers="bmd">
                    <FloatingPointHover value={results.bmd} />
                </td>
                <td headers="bmdu">
                    <FloatingPointHover value={results.bmdu} />
                </td>
                <td headers="p_value">{fractionalFormatter(getPValue(dataset.dtype, results))}</td>
                <td headers="aic">
                    <FloatingPointHover value={results.fit.aic} />
                </td>
                <td headers="roi0">{ff(results.gof.residual[0])}</td>
                <td headers="roi1">{ff(results.gof.roi)}</td>
                <RecommendationTd
                    store={store}
                    data={data}
                    selectedFrequentist={selectedFrequentist}
                />
            </tr>
        );
    }
}
FrequentistRow.propTypes = {
    store: PropTypes.object.isRequired,
    data: PropTypes.object.isRequired,
    dataset: PropTypes.object.isRequired,
    selectedFrequentist: PropTypes.object.isRequired,
    footnotes: PropTypes.array.isRequired,
};

@inject("outputStore")
@observer
class FrequentistResultTable extends Component {
    render() {
        const store = this.props.outputStore,
            dataset = store.selectedDataset,
            {selectedFrequentist, isNestedDichotomous} = store;

        if (!selectedFrequentist) {
            return null;
        }

        const {models} = selectedFrequentist,
            restrictedModels = getRestricted(models),
            unrestrictedModels = getUnrestricted(models),
            colWidths = getColWidths(store),
            numCols = colWidths.length,
            recommendedModelIndex = store.recommendationEnabled
                ? selectedFrequentist.recommender.results.recommended_model_index
                : null,
            footnotes = getFootnotes(recommendedModelIndex, selectedFrequentist.selected),
            reClass = store.recommendationEnabled ? ` col-l-${numCols}` : "";

        return (
            <table
                id="frequentist-model-result"
                className={`table table-sm text-right col-l-1 ${reClass}`}>
                <colgroup>
                    {_.map(colWidths).map((value, idx) => (
                        <col key={idx} width={`${value}%`}></col>
                    ))}
                </colgroup>
                <thead>
                    <tr className="bg-custom">
                        <th id="m-name">Model</th>
                        <th id="bmdl">BMDL</th>
                        <th id="bmd">BMD</th>
                        <th id="bmdu">BMDU</th>
                        <th id="p_value">
                            <i>P</i>-Value
                        </th>
                        <th id="aic">AIC</th>
                        {isNestedDichotomous ? null : <th id="roi0">Scaled Residual at Control</th>}
                        {isNestedDichotomous ? null : <th id="roi1">Scaled Residual near BMD</th>}
                        {store.recommendationEnabled ? (
                            <th id="rec">
                                <Button
                                    title="Toggle showing notes inline or popover"
                                    className="btn btn-info btn-sm float-right"
                                    onClick={store.toggleInlineNotes}
                                    text={store.showInlineNotes ? "Hide" : "Show"}
                                    icon={store.showInlineNotes ? "eye-slash-fill" : "eye-fill"}
                                />
                                Recommendation
                                <br />
                                and Notes
                            </th>
                        ) : null}
                    </tr>
                </thead>
                <tbody>
                    <FrequentistRowSet
                        store={store}
                        colSpan={numCols}
                        label={"Restricted Models"}
                        dataset={dataset}
                        models={restrictedModels}
                        selectedFrequentist={selectedFrequentist}
                        footnotes={footnotes}
                    />
                    <FrequentistRowSet
                        store={store}
                        colSpan={numCols}
                        label={"Unrestricted Models"}
                        dataset={dataset}
                        models={unrestrictedModels}
                        selectedFrequentist={selectedFrequentist}
                        footnotes={footnotes}
                    />
                </tbody>
                <TableFootnotes items={footnotes} colSpan={numCols} />
            </table>
        );
    }
}
FrequentistResultTable.propTypes = {
    outputStore: PropTypes.object,
};

export default FrequentistResultTable;
