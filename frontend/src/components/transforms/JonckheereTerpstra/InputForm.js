import { inject, observer } from "mobx-react";
import PropTypes from "prop-types";
import React, { Component } from "react";

import Button from "../../common/Button";
import SelectInput from "../../common/SelectInput";
import TextAreaInput from "../../common/TextAreaInput";
import { hypothesisChoices } from "./constants";

@inject("store")
@observer
class InputForm extends Component {
  render() {
    const {
      settings,
      updateSettings,
      loadExampleData,
      downloadExampleData,
      error,
      submit,
      reset,
    } = this.props.store;

    const executeClickHandler = async (e) => {
      e?.preventDefault?.();

      const executeButton = document.getElementById("executeButton");
      const resetButton = document.getElementById("resetButton");

      document.body.style.cursor = "wait";
      executeButton.style.cursor = "wait";
      resetButton.style.cursor = "wait";
      executeButton.disabled = true;
      resetButton.disabled = true;

      await new Promise(requestAnimationFrame);

      try {
        // Handles both sync and async submit()
        await Promise.resolve(submit());
      } finally {
        document.body.style.cursor = "";
        executeButton.style.cursor = "";
        resetButton.style.cursor = "";
        executeButton.disabled = false;
        resetButton.disabled = false;
      }
    };

    return (
      <form>
        <div className="row">
          <div className="col-lg-4">
            <SelectInput
              label="Hypothesis"
              choices={hypothesisChoices}
              value={settings.hypothesis}
              onChange={(value) => {
                updateSettings("hypothesis", value);
              }}
            />
            <p className="text-muted mb-0">Please select the hypothesis.</p>
          </div>
          <div className="col-lg-4">
            <TextAreaInput
              rows={6}
              label="Dataset"
              value={settings.dataset}
              onChange={(value) => updateSettings("dataset", value)}
            />
            <p className="text-muted mb-0">
              Copy and paste data from a CSV, or directly from Excel.&nbsp;
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  loadExampleData();
                }}
              >
                Load
              </a>
              &nbsp;or&nbsp;
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  downloadExampleData();
                }}
              >
                download
              </a>
              &nbsp;example data.
            </p>
          </div>
          <div className="col-lg-4">
            <label>&nbsp;</label>
            <Button
              className="btn btn-primary btn-block py-3"
              id="executeButton"
              onClick={executeClickHandler}
              text="Execute"
            />
            <Button
              className="btn btn-secondary btn-block"
              id="resetButton"
              onClick={reset}
              text="Reset"
            />
          </div>
        </div>
        {error ? (
          <div className="row">
            <div className="col-lg-8 offset-lg-2">
              <div className="alert alert-danger mt-3">
                <p>
                  <b>An error occurred.</b>
                </p>
                <pre>{JSON.stringify(error, null, 2)}</pre>
              </div>
            </div>
          </div>
        ) : null}
      </form>
    );
  }
}
InputForm.propTypes = {
  store: PropTypes.object,
};

export default InputForm;
