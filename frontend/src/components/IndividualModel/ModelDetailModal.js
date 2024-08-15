import {inject, observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";
import {Col, Modal, Row} from "react-bootstrap";

import * as dc from "@/constants/dataConstants";

import Button from "../common/Button";
import DoseResponsePlot from "../common/DoseResponsePlot";
import {MsComboInfo, MsComboSummary} from "../Output/Multitumor/MsCombo";
import MultitumorPlot from "../Output/Multitumor/MultitumorPlot";
import BootstrapResults from "../Output/NestedDichotomous/BootstrapResults";
import BootstrapRuns from "../Output/NestedDichotomous/BootstrapRuns";
import LitterData from "../Output/NestedDichotomous/LitterData";
import ScaledResidual from "../Output/NestedDichotomous/ScaledResidual";
import CDFPlot from "./CDFPlot";
import CDFTable from "./CDFTable";
import ContinuousDeviance from "./ContinuousDeviance";
import ContinuousTestOfInterest from "./ContinuousTestOfInterest";
import DichotomousDeviance from "./DichotomousDeviance";
import GoodnessFit from "./GoodnessFit";
import InfoTable from "./InfoTable";
import MaBenchmarkDose from "./MaBenchmarkDose";
import MaIndividualModels from "./MaIndividualModels";
import ModelOptionsTable from "./ModelOptionsTable";
import ModelParameters from "./ModelParameters";
import ParameterPriorTable from "./ParameterPriorTable";
import Summary from "./Summary";

const getCdfData = function(model) {
    return {
        bmd: model.results.bmd,
        bmdl: model.results.bmdl,
        bmdu: model.results.bmdu,
        alpha: model.settings.alpha,
    };
};

@observer
class ModelBody extends Component {
    render() {
        const {outputStore} = this.props,
            dataset = outputStore.selectedDataset,
            model = outputStore.modalModel,
            dtype = dataset.dtype,
            priorClass = model.settings.priors.prior_class,
            isDichotomous = dtype == dc.Dtype.DICHOTOMOUS,
            isContinuous = dtype == dc.Dtype.CONTINUOUS || dtype == dc.Dtype.CONTINUOUS_INDIVIDUAL;
        return (
            <Modal.Body>
                <Row>
                    <Col xl={4}>
                        <InfoTable />
                    </Col>
                    <Col xl={3}>
                        <ModelOptionsTable dtype={dtype} model={model} />
                    </Col>
                    <Col xl={5}>
                        <ParameterPriorTable
                            parameters={model.results.parameters}
                            priorClass={priorClass}
                        />
                    </Col>
                    <Col xl={4}>
                        <Summary store={outputStore} />
                    </Col>
                    <Col xl={8}>
                        <DoseResponsePlot
                            layout={outputStore.drIndividualPlotLayout}
                            data={outputStore.drIndividualPlotData}
                        />
                    </Col>
                    <Col xl={8}>
                        <ModelParameters isNestedDichotomous={false} model={model} />
                    </Col>
                    <Col xl={isDichotomous ? 8 : 12}>
                        <GoodnessFit store={outputStore} />
                    </Col>
                    {isDichotomous ? (
                        <Col xl={8}>
                            <DichotomousDeviance store={outputStore} />
                        </Col>
                    ) : null}
                    {isContinuous ? (
                        <Col xl={8}>
                            <ContinuousDeviance store={outputStore} />
                            <ContinuousTestOfInterest store={outputStore} />
                        </Col>
                    ) : null}
                </Row>
                <Row>
                    <Col xl={4} style={{maxHeight: "50vh", overflowY: "scroll"}}>
                        <CDFTable bmd_dist={model.results.fit.bmd_dist} />
                    </Col>
                    <Col xl={8}>
                        <CDFPlot
                            dataset={dataset}
                            cdf={model.results.fit.bmd_dist}
                            {...getCdfData(model)}
                        />
                    </Col>
                </Row>
            </Modal.Body>
        );
    }
}
ModelBody.propTypes = {
    outputStore: PropTypes.object,
};

@observer
class ModelAverageBody extends Component {
    render() {
        const {outputStore} = this.props,
            dataset = outputStore.selectedDataset,
            model = outputStore.modalModel,
            bayesian_models = outputStore.selectedOutput.bayesian.models;
        return (
            <Modal.Body>
                <Row>
                    <Col xl={3}>
                        <MaBenchmarkDose results={model.results} />
                    </Col>
                    <Col xl={9}>
                        <DoseResponsePlot
                            layout={outputStore.drBayesianPlotLayout}
                            data={outputStore.drBayesianPlotData}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xl={12}>
                        <MaIndividualModels model_average={model} models={bayesian_models} />
                    </Col>
                </Row>
                <Row>
                    <Col xl={4} style={{maxHeight: "50vh", overflowY: "scroll"}}>
                        <CDFTable bmd_dist={model.results.bmd_dist} />
                    </Col>
                    <Col xl={8}>
                        <CDFPlot
                            dataset={dataset}
                            cdf={model.results.bmd_dist}
                            {...getCdfData(model)}
                        />
                    </Col>
                </Row>
            </Modal.Body>
        );
    }
}
ModelAverageBody.propTypes = {
    outputStore: PropTypes.object,
};

@observer
class MultitumorModalBody extends Component {
    render() {
        const {outputStore} = this.props,
            model = outputStore.modalModel,
            isSummary = outputStore.drModelModalIsMA,
            dataset = outputStore.modalDataset;

        if (isSummary) {
            return (
                <Modal.Body>
                    <Row>
                        <Col xl={6}>
                            <MsComboInfo options={outputStore.selectedModelOptions} />
                        </Col>
                        <Col xl={6}>
                            <MsComboSummary results={model} />
                        </Col>
                        <Col xl={12}>
                            <MultitumorPlot />
                        </Col>
                    </Row>
                </Modal.Body>
            );
        }
        return (
            <Modal.Body>
                <Row>
                    <Col xl={4}>
                        <InfoTable />
                    </Col>
                    <Col xl={3}>
                        <ModelOptionsTable dtype={dataset.dtype} model={model} />
                    </Col>
                    <Col xl={5}>
                        <ParameterPriorTable
                            parameters={model.results.parameters}
                            priorClass={model.settings.priors.prior_class}
                        />
                    </Col>
                    <Col xl={4}>
                        <Summary model={model} />
                    </Col>
                    <Col xs={8}>
                        <DoseResponsePlot
                            layout={outputStore.drIndividualMultitumorPlotLayout}
                            data={outputStore.drIndividualMultitumorPlotData}
                        />
                    </Col>
                    <Col xl={8}>
                        <ModelParameters isNestedDichotomous={false} model={model} />
                    </Col>
                    <Col xl={8}>
                        <GoodnessFit store={outputStore} />
                    </Col>
                    <Col xl={8}>
                        <DichotomousDeviance store={outputStore} />
                    </Col>
                </Row>
                <Row>
                    <Col xl={4} style={{maxHeight: "50vh", overflowY: "scroll"}}>
                        <CDFTable bmd_dist={model.results.fit.bmd_dist} />
                    </Col>
                    <Col xl={8}>
                        <CDFPlot
                            dataset={dataset}
                            cdf={model.results.fit.bmd_dist}
                            {...getCdfData(model)}
                        />
                    </Col>
                </Row>
            </Modal.Body>
        );
    }
}
MultitumorModalBody.propTypes = {
    outputStore: PropTypes.object,
};

@observer
class NestedDichotomousModalBody extends Component {
    render() {
        const {outputStore} = this.props,
            dataset = outputStore.selectedDataset,
            dtype = dataset.dtype,
            model = outputStore.modalModel;

        return (
            <Modal.Body>
                <Row>
                    <Col xs={6}>
                        <InfoTable />
                    </Col>
                    <Col xs={6}>
                        <ModelOptionsTable dtype={dtype} model={model} />
                    </Col>
                    <Col xs={6}>
                        <Summary results={model.results} />
                    </Col>
                    <Col xs={6}>
                        <DoseResponsePlot
                            layout={outputStore.drIndividualPlotLayout}
                            data={outputStore.drIndividualPlotData}
                        />
                    </Col>
                    <Col xs={5}>
                        <ModelParameters isNestedDichotomous={true} model={model} />
                    </Col>
                    <Col xs={7}>
                        <ScaledResidual model={model} />
                    </Col>
                    <Col xs={5}>
                        <BootstrapResults model={model} />
                    </Col>
                    <Col xs={7}>
                        <BootstrapRuns model={model} />
                    </Col>
                    <Col xs={12}>
                        <LitterData model={model} />
                    </Col>
                </Row>
            </Modal.Body>
        );
    }
}
NestedDichotomousModalBody.propTypes = {
    outputStore: PropTypes.object,
};

@inject("outputStore")
@observer
class ModelDetailModal extends Component {
    getTitle() {
        const {outputStore} = this.props;
        if (outputStore.drModelModalIsMA) {
            return outputStore.modalName;
        }
        return `${outputStore.modalName} Model`;
    }
    getBody() {
        const {outputStore} = this.props;
        if (outputStore.isMultiTumor) {
            return MultitumorModalBody;
        } else if (outputStore.drModelModalIsMA) {
            return ModelAverageBody;
        } else if (outputStore.isNestedDichotomous) {
            return NestedDichotomousModalBody;
        } else {
            return ModelBody;
        }
    }
    render() {
        const {outputStore} = this.props,
            model = outputStore.modalModel;

        if (!model) {
            return null;
        }

        const name = this.getTitle(),
            Body = this.getBody();

        return (
            <Modal
                show={outputStore.showModelModal}
                onHide={outputStore.closeModal}
                size="xl"
                centered>
                <Modal.Header>
                    <Modal.Title>{name}</Modal.Title>
                    <Button
                        id="close-modal"
                        className="btn btn-secondary float-right"
                        onClick={outputStore.closeModal}
                        icon="x-circle"
                    />
                </Modal.Header>
                <Body outputStore={outputStore} />
            </Modal>
        );
    }
}
ModelDetailModal.propTypes = {
    outputStore: PropTypes.object,
};
export default ModelDetailModal;
