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
          <p>
            Add paragraph 1{" "}
            {ExternalAnchor(
              "https://pubmed.ncbi.nlm.nih.gov/27567129/",
              "Link Display Text",
            )}
            , This is some example text.
          </p>
          <p>
            Add paragraph 2 <i>This is an example of italics text</i>
          </p>
          <p>Add paragraph 3</p>
          <div className="alert alert-info my-3">
            <strong>Note:</strong> This is an example of an important note.
          </div>
          <p>
            Add paragraph 4, here are some examples of formula text:{" "}
            <IM f="D" />
          </p>
          <p>
            An example of subscript: <IM f="A_f" /> and a fraction:{" "}
            <IM f="P_f = \frac{A_f}{N_f}" /> And a couple more:{" "}
            <IM f="{N_{f}}_{RS}=\frac{N_f}{D}" /> and{" "}
            <IM f="{AF_{f}}_{RS}=\frac{A_f}{D}" />
          </p>
          <p>Add another paragraph.</p>
          <table className="table table-condensed table-striped">
            <thead>
              <tr>
                <th>TableHeader1</th>
                <th>TableHeader2</th>
                <th>$n$, TableHeader3</th>
                <th>$n$, TableHeader4</th>
                <th>$a$</th>
                <th>$b$</th>
                <th>
                  <IM f="\sigma_{res}^2" />
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Row1</td>
                <td>E</td>
                <td>1</td>
                <td>2</td>
                <td>3</td>
                <td>4</td>
                <td>5</td>
              </tr>
              <tr>
                <td>Row2</td>
                <td>X</td>
                <td>1</td>
                <td>2</td>
                <td>3</td>
                <td>4</td>
                <td>5</td>
              </tr>
              <tr>
                <td>Row3</td>
                <td>A</td>
                <td>1</td>
                <td>2</td>
                <td>3</td>
                <td>4</td>
                <td>5</td>
              </tr>
              <tr>
                <td>Row4</td>
                <td>M</td>
                <td>1</td>
                <td>2</td>
                <td>3</td>
                <td>4</td>
                <td>5</td>
              </tr>
              <tr>
                <td>Row5</td>
                <td>P</td>
                <td>1</td>
                <td>2</td>
                <td>3</td>
                <td>4</td>
                <td>5</td>
              </tr>
              <tr>
                <td>Row6</td>
                <td>LE</td>
                <td>1</td>
                <td>2</td>
                <td>3</td>
                <td>4</td>
                <td>5</td>
              </tr>
            </tbody>
          </table>
          <p>Add another paragraph</p>
          <p>Add another paragraph</p>
          <p>Add another paragraph</p>
          <h3>Add a header</h3>
          <p>Add another paragraph</p>

          <ol>
            <li>
              <strong>Ordered List example</strong> - add your text here
            </li>
            <li>
              <strong>bold text</strong> - add your text here
            </li>
            <li>
              <strong>bold text</strong> - add your text here
            </li>
          </ol>
          <p>Add another paragraph</p>
          <h3>Add another header</h3>
          <ol>
            <li>Another list example</li>
            <li>Replace this text with your own</li>
          </ol>
          <p>
            You can add another <strong>paragraph</strong> right here
          </p>
          <h3>Another Header</h3>
          <p>
            Add another paragraph with some link-out buttons at the end{" "}
            {ExternalAnchor(
              "https://pubmed.ncbi.nlm.nih.gov/27567129/",
              "Link 1",
              "p-2 mx-1 badge badge-info",
            )}
            {ExternalAnchor(
              "https://pubmed.ncbi.nlm.nih.gov/27567129/",
              "Link 2",
              "p-2 mx-1 badge badge-info",
            )}
          </p>
        </Modal.Body>
      </Modal>
    );
  }
}
AboutModal.propTypes = {
  store: PropTypes.object,
};
export default AboutModal;
