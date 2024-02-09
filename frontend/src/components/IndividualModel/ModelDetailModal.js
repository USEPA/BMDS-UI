import {inject, observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";
import {Col, Modal, Row} from "react-bootstrap";

import * as dc from "@/constants/dataConstants";

import Button from "../common/Button";
import DoseResponsePlot from "../common/DoseResponsePlot";
import MultitumorModalBody from "../Output/Multitumor/ModalBody";
import NestedDichotomousModalBody from "../Output/NestedDichotomous/ModalBody";
import CDFPlot from "./CDFPlot";
import CDFTable from "./CDFTable";
import ContinuousDeviance from "./ContinuousDeviance";
import ContinuousSummary from "./ContinuousSummary";
import ContinuousTestOfInterest from "./ContinuousTestOfInterest";
import DichotomousDeviance from "./DichotomousDeviance";
import DichotomousSummary from "./DichotomousSummary";
import GoodnessFit from "./GoodnessFit";
import InfoTable from "./InfoTable";
import MaBenchmarkDose from "./MaBenchmarkDose";
import MaIndividualModels from "./MaIndividualModels";
import ModelOptionsTable from "./ModelOptionsTable";
import ModelParameters from "./ModelParameters";
import ParameterPriorTable from "./ParameterPriorTable";

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
                </Row>
                <Row>
                    <Col xl={4}>
                        {isDichotomous ? <DichotomousSummary store={outputStore} /> : null}
                        {isContinuous ? <ContinuousSummary store={outputStore} /> : null}
                    </Col>
                    <Col xl={8}>
                        <DoseResponsePlot
                            layout={outputStore.drIndividualPlotLayout}
                            data={outputStore.drIndividualPlotData}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xl={8}>
                        <ModelParameters parameters={model.results.parameters} />
                    </Col>
                </Row>
                <Row>
                    <Col xl={isDichotomous ? 8 : 12}>
                        <GoodnessFit store={outputStore} />
                    </Col>
                </Row>
                {isDichotomous ? (
                    <Row>
                        <Col xl={8}>
                            <DichotomousDeviance store={outputStore} />
                        </Col>
                    </Row>
                ) : null}
                {isContinuous ? (
                    <Row>
                        <Col xl={8}>
                            <ContinuousDeviance store={outputStore} />
                            <ContinuousTestOfInterest store={outputStore} />
                        </Col>
                    </Row>
                ) : null}
                <Row>
                    <Col xl={4} style={{maxHeight: "50vh", overflowY: "scroll"}}>
                        <CDFTable bmd_dist={model.results.fit.bmd_dist} />
                    </Col>
                    <Col xl={8}>
                        <CDFPlot dataset={dataset} cdf={model.results.fit.bmd_dist} />
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
                        <CDFPlot dataset={dataset} cdf={model.results.bmd_dist} />
                    </Col>
                </Row>
            </Modal.Body>
        );
    }
}
ModelAverageBody.propTypes = {
    outputStore: PropTypes.object,
};

@inject("outputStore")
@observer
class ModelDetailModal extends Component {
    getTitle() {
        const {outputStore} = this.props;
        return outputStore.modalName;
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
