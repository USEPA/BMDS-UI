import "./Output.css";

import {inject, observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";

import DatasetTable from "../Data/DatasetTable";
import {ContinuousTestOfInterestDatasetFootnote} from "../IndividualModel/ContinuousTestOfInterest";
import ModelDetailModal from "../IndividualModel/ModelDetailModal";
import DoseResponsePlot from "../common/DoseResponsePlot";
import Icon from "../common/Icon";
import SelectInput from "../common/SelectInput";
import BayesianResultTable from "./BayesianResultTable";
import FrequentistResultTable from "./FrequentistResultTable";
import MultitumorDatasetTable from "./Multitumor/DatasetTable";
import MultitumorPlot from "./Multitumor/MultitumorPlot";
import MultitumorResultTable from "./Multitumor/ResultTable";
import OptionSetTable from "./OptionSetTable";
import SelectModel from "./SelectModel";

const OutputErrorComponent = ({title, children, alertClass}) => {
    return (
        <div className={`alert ${alertClass} offset-lg-2 col-lg-8 mt-4`}>
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
    alertClass: PropTypes.string,
};
OutputErrorComponent.defaultProps = {
    alertClass: "alert-danger",
};

@inject("outputStore")
@observer
class Output extends Component {
    renderDataset() {
        const {outputStore} = this.props;

        if (outputStore.isMultiTumor) {
            return <MultitumorDatasetTable />;
        }
        const footnote = outputStore.showContinuousDatasetFootnote ? (
            <ContinuousTestOfInterestDatasetFootnote />
        ) : undefined;
        return <DatasetTable dataset={outputStore.selectedDataset} footnotes={footnote} />;
    }

    render() {
        const {outputStore} = this.props,
            {hasNoResults, hasAnyError, selectedFrequentist, selectedBayesian} = outputStore,
            {analysisSavedAndValidated, canSelectModel} = outputStore.rootStore.mainStore;

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

        return (
            <div className="container-fluid mb-3">
                {!analysisSavedAndValidated ? (
                    <div className="row py-2">
                        <OutputErrorComponent
                            title="Outputs may be out of date"
                            alertClass="alert-warning">
                            <p>
                                There are unsaved changes made to the inputs, and the existing
                                outputs may be out of date. Please save and execute again to the
                                view updated outputs, or refresh the page to reset your current
                                changes.
                            </p>
                        </OutputErrorComponent>
                    </div>
                ) : null}
                <div className="row py-2">
                    {outputStore.outputs.length > 1 ? (
                        <div className="col-lg-2">
                            <SelectInput
                                label="Select an output"
                                onChange={value =>
                                    outputStore.setSelectedOutputIndex(parseInt(value))
                                }
                                value={outputStore.selectedOutputIndex}
                                choices={outputStore.outputs.map((_output, idx) => {
                                    return {value: idx, text: outputStore.getOutputName(idx)};
                                })}
                            />
                        </div>
                    ) : null}
                    <div className="col-lg-6">{this.renderDataset()}</div>
                    <div className="col-lg-4">
                        <OptionSetTable />
                    </div>
                </div>
                {selectedFrequentist ? (
                    outputStore.isMultiTumor ? (
                        <div className="row">
                            <div className="col-lg-12">
                                <h3>Model Results</h3>
                                <MultitumorResultTable />
                                <MultitumorPlot />
                            </div>
                        </div>
                    ) : (
                        <div className="row py-2">
                            <div className="col-lg-8">
                                <h3>Maximum Likelihood Approach Model Results</h3>
                                <FrequentistResultTable />
                                {canSelectModel ? <SelectModel /> : null}
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
                    <div className="row py-2">
                        <div className="col-lg-12">
                            <h3>Bayesian Model Results</h3>
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

                <div>{outputStore.showModelModal ? <ModelDetailModal /> : null}</div>
            </div>
        );
    }
}
Output.propTypes = {
    outputStore: PropTypes.object,
};
export default Output;
