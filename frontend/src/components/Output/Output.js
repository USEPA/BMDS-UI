import "./Output.css";

import {inject, observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";

import DoseResponsePlot from "../common/DoseResponsePlot";
import Icon from "../common/Icon";
import SelectInput from "../common/SelectInput";
import DatasetTable from "../Data/DatasetTable";
import ModelDetailModal from "../IndividualModel/ModelDetailModal";
import BayesianResultTable from "./BayesianResultTable";
import FrequentistResultTable from "./FrequentistResultTable";
import MultitumorDatasetTable from "./Multitumor/DatasetTable";
import MultitumorPlot from "./Multitumor/MultitumorPlot";
import MultitumorResultTable from "./Multitumor/ResultTable";
import OptionSetTable from "./OptionSetTable";
import SelectModel from "./SelectModel";

const OutputErrorComponent = ({title, children}) => {
    return (
        <div className="alert alert-danger offset-lg-2 col-lg-8 mt-4">
            <p>
                <strong>
                    <Icon name="exclamation-triangle-fill" text={title} />
                </strong>
            </p>
            {children}
        </div>
    );
};
OutputErrorComponent.propTypes = {
    title: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
};

@inject("outputStore")
@observer
class Output extends Component {
    render() {
        const {outputStore} = this.props,
            {
                canEdit,
                hasNoResults,
                hasAnyError,
                selectedFrequentist,
                selectedBayesian,
            } = outputStore,
            {isFuture, analysisSavedAndValidated} = outputStore.rootStore.mainStore;

        if (hasAnyError) {
            return (
                <OutputErrorComponent title="An error occurred">
                    <p>
                        An error occurred with these settings. Please contact us if you require
                        assistance.
                    </p>
                </OutputErrorComponent>
            );
        }

        if (hasNoResults) {
            return (
                <OutputErrorComponent title="No results available">
                    <p>No results available; please execute analysis.</p>
                </OutputErrorComponent>
            );
        }

        if (!analysisSavedAndValidated) {
            return (
                <OutputErrorComponent title="Output cannot be displayed">
                    <p>
                        There are unsaved changes made to the inputs, and the existing outputs can
                        no longer be displayed. Please save and execute again to the view updated
                        outputs, or refresh the page to reset your current changes.
                    </p>
                </OutputErrorComponent>
            );
        }

        return (
            <div className="container-fluid mb-3">
                <div className="row">
                    {outputStore.outputs.length > 1 ? (
                        <div className="col-lg-2">
                            <SelectInput
                                label="Select an output"
                                onChange={value =>
                                    outputStore.setSelectedOutputIndex(parseInt(value))
                                }
                                value={outputStore.selectedOutputIndex}
                                choices={outputStore.outputs.map((output, idx) => {
                                    return {value: idx, text: outputStore.getOutputName(idx)};
                                })}
                            />
                        </div>
                    ) : null}
                    <div className="col-lg-6">
                        {outputStore.isMultiTumor ? (
                            <MultitumorDatasetTable />
                        ) : (
                            <DatasetTable dataset={outputStore.selectedDataset} />
                        )}
                    </div>
                    <div className="col-lg-4">
                        <OptionSetTable />
                    </div>
                </div>
                {selectedFrequentist ? (
                    outputStore.isMultiTumor ? (
                        <div className="row">
                            <div className="col-lg-12">
                                <h4>Model Results</h4>
                                <MultitumorResultTable />
                                <MultitumorPlot />
                            </div>
                        </div>
                    ) : (
                        <div className="row">
                            <div className="col-lg-8">
                                <h4>Frequentist Model Results</h4>
                                <FrequentistResultTable />
                                {canEdit ? <SelectModel /> : null}
                            </div>
                            <div className="align-items-center d-flex col-lg-4">
                                <DoseResponsePlot
                                    onRelayout={outputStore.updateUserPlotSettings}
                                    layout={outputStore.drFrequentistPlotLayout}
                                    data={outputStore.drFrequentistPlotData}
                                />
                            </div>
                        </div>
                    )
                ) : null}
                {selectedBayesian ? (
                    <div className="row">
                        <div className="col-lg-12">
                            <h4>Bayesian Model Results</h4>
                            <BayesianResultTable />
                        </div>
                        <div className="col-lg-12">
                            <DoseResponsePlot
                                onRelayout={outputStore.updateUserPlotSettings}
                                layout={outputStore.drBayesianPlotLayout}
                                data={outputStore.drBayesianPlotData}
                            />
                        </div>
                    </div>
                ) : null}

                {isFuture && !outputStore.isMultiTumor ? (
                    <div className="row">
                        {selectedFrequentist ? (
                            <div className="col col-lg-6">
                                <DoseResponsePlot
                                    layout={outputStore.drFrequentistLollipopPlotLayout}
                                    data={outputStore.drFrequentistLollipopPlotDataset}
                                />
                            </div>
                        ) : null}
                        {selectedBayesian ? (
                            <div className="col col-lg-6">
                                <DoseResponsePlot
                                    layout={outputStore.drBayesianLollipopPlotLayout}
                                    data={outputStore.drBayesianLollipopPlotDataset}
                                />
                            </div>
                        ) : null}
                    </div>
                ) : null}

                <div>{outputStore.showModelModal ? <ModelDetailModal /> : null}</div>
            </div>
        );
    }
}
Output.propTypes = {
    outputStore: PropTypes.object,
};
export default Output;
