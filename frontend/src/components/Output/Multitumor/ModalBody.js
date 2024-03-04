import {observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";
import {Col, Modal, Row} from "react-bootstrap";

import DoseResponsePlot from "../../common/DoseResponsePlot";
import GoodnessFit from "../../IndividualModel/GoodnessFit";
import ModelParameters from "../../IndividualModel/ModelParameters";
import AnalysisOfDeviance from "./AnalysisOfDeviance";
import InfoTable from "./InfoTable";
import ModelOptions from "./ModelOptions";
import {MsComboInfo, MsComboSummary} from "./MsCombo";
import MultitumorPlot from "./MultitumorPlot";
import ParameterSettings from "./ParameterSettings";
import Summary from "./Summary";

@observer
class ModalBody extends Component {
    render() {
        const {outputStore} = this.props,
            model = outputStore.modalModel,
            isSummary = outputStore.drModelModalIsMA;

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
                    <Col xl={4}>
                        <ModelOptions />
                    </Col>
                    <Col xl={4}>
                        <ParameterSettings model={model} />
                    </Col>
                    <Col xl={6}>
                        <Summary model={model} />
                    </Col>
                    <Col xs={6}>
                        <DoseResponsePlot
                            layout={outputStore.drIndividualMultitumorPlotLayout}
                            data={outputStore.drIndividualMultitumorPlotData}
                        />
                    </Col>
                    <Col xl={6}>
                        <ModelParameters parameters={model.parameters} />
                    </Col>
                    <Col xl={6}>
                        <GoodnessFit store={outputStore} />
                    </Col>
                    <Col xl={6}>
                        <AnalysisOfDeviance model={model} />
                    </Col>
                </Row>
            </Modal.Body>
        );
    }
}
ModalBody.propTypes = {
    outputStore: PropTypes.object,
};
export default ModalBody;
