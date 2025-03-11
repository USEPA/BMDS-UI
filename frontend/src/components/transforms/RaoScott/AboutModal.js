import {inject, observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";
import {Modal} from "react-bootstrap";

@inject("store")
@observer
class AboutModal extends Component {
    render() {
        const {store} = this.props;
        return (
            <Modal size="xl" show={store.showAboutModal} onHide={() => store.setAboutModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Rao Scott Adjustment</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>...</p>
                </Modal.Body>
            </Modal>
        );
    }
}
AboutModal.propTypes = {
    store: PropTypes.object,
};
export default AboutModal;
