import "./Output.css";

import { inject, observer } from "mobx-react";
import PropTypes from "prop-types";
import React, { Component } from "react";

import DatasetTable from "../Data/DatasetTable";
import { ContinuousTestOfInterestDatasetFootnote } from "../IndividualModel/ContinuousTestOfInterest";
import ModelDetailModal from "../IndividualModel/ModelDetailModal";
import AdditionalNestedPlotsModal from "../IndividualModel/AdditionalNestedPlotsModal";
import DoseResponsePlot from "../common/DoseResponsePlot";
import Icon from "../common/Icon";
import Button from "../common/Button";
import SelectInput from "../common/SelectInput";
import ToxicRBayesianResultTable from "./ToxicRBayesianResultTable";
import LOUDBayesianResultTable from "./LOUDBayesianResultTable";
import FrequentistResultTable from "./FrequentistResultTable";
import MultitumorDatasetTable from "./Multitumor/DatasetTable";
import MultitumorPlot from "./Multitumor/MultitumorPlot";
import MultitumorResultTable from "./Multitumor/ResultTable";
import OptionSetTable from "./OptionSetTable";
import McmcSetTable from "./McmcSetTable";
import CochranArmitageTable from "./CochranArmitageTable";
import SelectModel from "./SelectModel";

const OutputErrorComponent = ({ title, children, alertClass }) => {
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

const OutputLoadingComponent = ({ title, children, alertClass }) => {
  return (
    <div className={`alert ${alertClass} offset-lg-2 col-lg-8 mt-4`}>
      <p>
        <strong>
          <Icon name="hourglass-split" text={title} />
        </strong>
      </p>
      {children}
    </div>
  );
};

OutputLoadingComponent.propTypes = {
  title: PropTypes.string.isRequired,
  alertClass: PropTypes.string,
};
OutputLoadingComponent.defaultProps = {
  alertClass: "alert-info",
};

@inject("outputStore")
@observer
class Output extends Component {
  renderDataset() {
    const { outputStore } = this.props;

    if (outputStore.isMultiTumor) {
      return <MultitumorDatasetTable />;
    }
    const footnote = outputStore.showContinuousDatasetFootnote ? (
      <ContinuousTestOfInterestDatasetFootnote />
    ) : undefined;
    return (
      <div>
        <DatasetTable
          dataset={outputStore.selectedDataset}
          footnotes={footnote}
        />
      </div>
    );
  }

  render() {
    const { outputStore } = this.props,
      {
        hasNoResults,
        hasAnyError,
        selectedFrequentist,
        selectedToxicRBayesian,
        selectedLOUDBayesian,
        outputLoading,
      } = outputStore,
      { analysisSavedAndValidated, canSelectModel } =
        outputStore.rootStore.mainStore;

    if (outputLoading && hasNoResults) {
      return (
        <OutputLoadingComponent title="Loading output... ">
          <p>Please wait</p>
        </OutputLoadingComponent>
      );
    }

    if (hasAnyError) {
      return (
        <OutputErrorComponent title="An error occurred">
          <p>
            An error occurred with these settings. Please contact us if you
            require assistance.
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
              alertClass="alert-warning"
            >
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
                onChange={(value) =>
                  outputStore.setSelectedOutputIndex(parseInt(value))
                }
                value={outputStore.selectedOutputIndex}
                choices={outputStore.outputs.map((_output, idx) => {
                  return { value: idx, text: outputStore.getOutputName(idx) };
                })}
              />
            </div>
          ) : null}
          <div
            className={outputStore.outputs.length > 1 ? "col-lg-4" : "col-lg-5"}
          >
            <div>{this.renderDataset()}</div>
          </div>
          <div className="col-lg-6">
            <div className="row g-4">
              <div className="col-md-4">
                <OptionSetTable />
              </div>

              {outputStore.selectedLOUDBayesian ? (
                <div className="col-md-4">
                  <McmcSetTable />
                </div>
              ) : null}

              {outputStore.isDichotomous && outputStore.cochranArmitage ? (
                <div className="col-md-4">
                  <CochranArmitageTable />
                </div>
              ) : null}
            </div>
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
              <div className="align-items-center col-lg-4">
                <DoseResponsePlot
                  onRelayout={outputStore.updateUserPlotSettings}
                  layout={outputStore.drFrequentistPlotLayout}
                  data={outputStore.drFrequentistPlotData}
                />
                <div>
                  {outputStore.isNestedDichotomous ? (
                    <Button
                      className="btn btn-info btn-sm float-right mt-2"
                      icon="eye-fill"
                      onClick={(e) => {
                        e.preventDefault();
                        outputStore.viewAdditionalNestedPlots();
                      }}
                      text="View Additional Plots"
                    />
                  ) : null}
                </div>
              </div>
            </div>
          )
        ) : null}
        {selectedLOUDBayesian ? (
          <div className="row py-2">
            <div className="col-lg-7">
              <h3>LOUD Bayesian Model Results</h3>
              <LOUDBayesianResultTable />
            </div>
            <div className="col-lg-5">
              <DoseResponsePlot
                onRelayout={outputStore.updateUserPlotSettings}
                layout={outputStore.drBayesianPlotLayout}
                data={outputStore.drLOUDBayesianPlotData}
              />
            </div>
            <div
              className="col-lg-6"
              style={{
                display: "flex",
                flexDirection: "column",
                paddingTop: "20px",
                maxWidth: "45%",
              }}
            >
              <h4
                style={{
                  display: "inline-block",
                  paddingBottom: "10px",
                }}
              >
                Posterior distribution of model-averaged BMD
              </h4>
              <img
                src={outputStore.LOUDPosteriorPlotContent}
                alt="Posterior distribution of
              model-averaged BMD"
                style={{ maxWidth: "100%", height: "auto", display: "block" }}
              />
            </div>

            <div
              className="col-lg-6"
              style={{
                display: "flex",
                flexDirection: "column",
                paddingTop: "20px",
                maxWidth: "55%",
              }}
            >
              <h4
                style={{
                  display: "inline-block",
                  paddingBottom: "10px",
                }}
              >
                Overlay of model-specific and model-averaged BMD distributions
              </h4>
              <img
                src={outputStore.LOUDOverlayPlotContent}
                alt="Overlay of model-specific and model-averaged BMD distributions"
                style={{ maxWidth: "100%", height: "auto", display: "block" }}
              />
            </div>
          </div>
        ) : null}
        {selectedToxicRBayesian ? (
          <div className="row py-2">
            <div className="col-lg-7">
              <h3>ToxicR Bayesian Model Results</h3>
              <ToxicRBayesianResultTable />
            </div>
            <div className="col-lg-5">
              <DoseResponsePlot
                onRelayout={outputStore.updateUserPlotSettings}
                layout={outputStore.drBayesianPlotLayout}
                data={outputStore.drToxicRBayesianPlotData}
              />
            </div>
          </div>
        ) : null}

        <div>{outputStore.showModelModal ? <ModelDetailModal /> : null}</div>
        <div>
          {outputStore.showNestedModal ? <AdditionalNestedPlotsModal /> : null}
        </div>
      </div>
    );
  }
}
Output.propTypes = {
  outputStore: PropTypes.object,
};
export default Output;
