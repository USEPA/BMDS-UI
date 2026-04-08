import { inject, observer } from "mobx-react";
import PropTypes from "prop-types";
import React, { Component } from "react";

import AboutModal from "./AboutModal";
import InputForm from "./InputForm";
import OutputTabs from "./Output";

@inject("store")
@observer
class App extends Component {
  render() {
    const { showAboutModal, setAboutModal, outputs } = this.props.store;
    return (
      <div className="container py-3">
        <div className="d-flex justify-content-between">
          <h2>Jonckheere-Terpstra Trend Test</h2>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setAboutModal(true)}
          >
            About
          </button>
        </div>
        <>{showAboutModal ? <AboutModal store={this.props.store} /> : null}</>
        <p className="text-muted col-lg-8">
          [INSERT DESCRIPTION OF THIS MODULE]. For more details, review the
          software{" "}
          <a href="#" onClick={() => setAboutModal(true)}>
            description
          </a>
          .
        </p>
        <h3>Settings</h3>
        <InputForm />
        {outputs ? <OutputTabs /> : null}
      </div>
    );
  }
}
App.propTypes = {
  store: PropTypes.object,
};
export default App;
