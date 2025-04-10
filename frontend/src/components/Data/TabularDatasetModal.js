import {inject, observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";
import {Modal} from "react-bootstrap";

import Button from "../common/Button";
import TextAreaInput from "../common/TextAreaInput";

@inject("dataStore")
@observer
class TabularDatasetModal extends Component {
    render() {
        const {dataStore} = this.props;
        return (
            <Modal show={dataStore.showTabularModal} onHide={dataStore.toggleDatasetModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Load Dataset from Excel</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <div className="form-group">
                        <p className="text-muted">
                            Copy and paste data from Excel into the text area below. Data must be
                            all numeric with no headers or descriptive columns.
                        </p>

                        {dataStore.tabularModalError ? (
                            <div className="alert alert-warning mb-2" role="alert">
                                {dataStore.tabularModalError}
                            </div>
                        ) : null}

                        <TextAreaInput
                            className="form-control"
                            rows={16}
                            onChange={dataStore.changeDatasetFromModal}
                            value={dataStore.tabularModalText}
                        />
                    </div>
                </Modal.Body>

                <Modal.Footer>
                    <Button
                        className="btn btn-secondary"
                        onClick={dataStore.toggleDatasetModal}
                        text="Cancel"
                    />
                    <Button
                        className="btn btn-primary"
                        onClick={dataStore.updateDatasetFromModal}
                        disabled={!dataStore.tabularModalDataValidated}
                        text="Load"
                        icon="check-lg"
                    />
                </Modal.Footer>
            </Modal>
        );
    }
}
TabularDatasetModal.propTypes = {
    dataStore: PropTypes.object,
};
export default TabularDatasetModal;
