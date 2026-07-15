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
                    <Modal.Title>Additional Nested Dichotomous Plots</Modal.Title>
                    <Button
                        id="close-nested-dichotomous-modal"
                        className="btn btn-secondary float-right"
                        onClick={outputStore.closeNestedModal}
                        icon="x-circle"
                    />
                </Modal.Header>
                <Modal.Body>
                    {outputStore.AdditionalNestedPlotsContent ? (
                        <img
                            src={outputStore.AdditionalNestedPlotsContent}
                            alt="Nested dichotomous plot"
                            style={{maxWidth: "90%", height: "auto", display: "block"}}
                        />
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
