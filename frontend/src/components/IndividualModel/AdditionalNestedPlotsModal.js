import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject, observer } from "mobx-react";
import { Modal } from "react-bootstrap";
import Button from "../common/Button";

@inject("outputStore")
@observer
class AdditionalNestedPlotsModal extends Component {
  render() {
    const { outputStore } = this.props;

    return (
      <Modal
        show={outputStore.showNestedModal}
        onHide={outputStore.closeNestedModal}
        centered
      >
        <Modal.Header>
          <Modal.Title>Notification</Modal.Title>
          <Button
            id="close-hello-modal"
            className="btn btn-secondary float-right"
            onClick={outputStore.closeNestedModal}
            icon="x-circle"
          />
        </Modal.Header>
        <Modal.Body>{outputStore.helloMessage || "hello"}</Modal.Body>
      </Modal>
    );
  }
}
AdditionalNestedPlotsModal.propTypes = {
  outputStore: PropTypes.object,
};
export default AdditionalNestedPlotsModal;
