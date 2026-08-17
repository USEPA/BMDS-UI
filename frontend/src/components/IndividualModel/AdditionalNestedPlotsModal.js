import {inject, observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";
import {Modal} from "react-bootstrap";
import Button from "../common/Button";

@inject("outputStore")
@observer
class AdditionalNestedPlotsModal extends Component {
    render() {
        const {outputStore} = this.props;

        return (
            <Modal
                show={outputStore.showNestedModal}
                onHide={outputStore.closeNestedModal}
                centered
                size="xl">
                <Modal.Header>
                    <Modal.Title>Variability Within Dose Groups</Modal.Title>
                    <Button
                        id="close-nested-dichotomous-modal"
                        className="btn btn-secondary float-right"
                        onClick={outputStore.closeNestedModal}
                        icon="x-circle"
                    />
                </Modal.Header>
                <Modal.Body>
                    {outputStore.AdditionalNestedPlotsContent ? (
                        <>
                            <div className=" p-3 border border-info border-3 rounded mb-3">
                                Some cases arise where models with intralitter correlation (ILC)
                                estimated give a much better fit than corresponding models where ILC
                                was not included in the model. This happens even when the estimated
                                mean response rates (from the dose-response equation) appear very
                                similar across those two models and very closely match the
                                observations (as summarized in the traditional dose-response plots
                                as the total number of responders over the total number of fetuses,
                                ignoring litter membership). The plots below show, for each
                                individual dose group, the observed number of litters with certain
                                numbers of responding fetuses vs. the model estimate of that value,
                                allowing users to visually ascertain how well each variation of the
                                nested model predicts the "correct" number of responding fetuses per
                                litter per dose group.
                            </div>
                            <img
                                src={outputStore.AdditionalNestedPlotsContent}
                                alt="Nested dichotomous plot"
                                style={{maxWidth: "90%", height: "auto", display: "block"}}
                            />
                        </>
                    ) : (
                        "No Content"
                    )}
                </Modal.Body>
            </Modal>
        );
    }
}
AdditionalNestedPlotsModal.propTypes = {
    outputStore: PropTypes.object,
};
export default AdditionalNestedPlotsModal;
