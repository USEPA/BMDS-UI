import { inject, observer } from "mobx-react";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { Modal } from "react-bootstrap";

import ExternalAnchor from "@/components/common/ExternalAnchor";
import IM, { typesetMath } from "@/components/common/InlineMath";

@inject("store")
@observer
class AboutModal extends Component {
  componentDidMount() {
    typesetMath();
  }
  render() {
    const { store } = this.props;
    return (
      <Modal
        size="xl"
        show={store.showAboutModal}
        onHide={() => store.setAboutModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Jonckheere-Terpstra Trend Test</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h3>Software Inputs</h3>
          <p>
            The dataset used for the Jonckheere-Terpstra trend test should have
            the same structure as Summarized Continuous or Individual Continuous
            data and should have the following columns in this sequence:
          </p>
          <h5>Summarized Contintuous Data Input</h5>
          <ol>
            <li>
              <strong>doses</strong> - the numeric value of each dose group
            </li>
            <li>
              <strong>ns</strong> - the total number of subjects per dose group
            </li>
            <li>
              <strong>means</strong> - the numeric value for the mean response
              per dose group
            </li>
            <li>
              <strong>stdevs</strong> - the numeric value for the standard
              deviation per dose group
            </li>
          </ol>
          <h5>Individual Continuous Data Input</h5>
          <ol>
            <li>
              <strong>doses</strong> - the numeric value of each dose
            </li>
            <li>
              <strong>responses</strong> - the response value for each
              individual
            </li>
          </ol>
          <h5>Settings Inputs</h5>
          <ol>
            <li>
              <strong>Hypothesis</strong> - [Increasing, Decreasing, Two-Sided]
            </li>
            <li>
              <strong>Number of Permutations</strong> - (optional) Setting a
              number of permutations will run the test using 'permutation'
              approach.
            </li>
          </ol>
          <h3>Software Outputs</h3>
          <ol>
            <li>
              <strong>Hypothesis</strong> - [Increasing, Decreasing, Two-Sided]
            </li>
            <li>
              <strong>Statistic</strong>
            </li>
            <li>
              <strong>Approach (P-Value)</strong> - [exact, approximate,
              permutation]
            </li>
            <li>
              <strong>P-Value</strong>
            </li>
          </ol>
        </Modal.Body>
      </Modal>
    );
  }
}
AboutModal.propTypes = {
  store: PropTypes.object,
};
export default AboutModal;
