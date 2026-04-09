import _ from "lodash";
import { inject, observer } from "mobx-react";
import PropTypes from "prop-types";
import React, { Component } from "react";

import Button from "@/components/common/Button";
import ClipboardButton from "@/components/common/ClipboardButton";
import Table from "@/components/common/Table";

@inject("store")
@observer
class OutputTabs extends Component {
  render() {
    const { outputs, downloadExcel, downloadWord, clipboardData } =
      this.props.store;
    const df = outputs.answer;
    const labels = ["Hypothesis", "Statistic", "Approach (P-Value)", "P-Value"];
    return (
      <>
        <div className="row d-flex">
          <h3 className="pt-3 mb-0">Results</h3>
          <div className="dropdown ml-auto align-self-start z-index-10000">
            <Button
              text="Actions&nbsp;"
              className="btn btn-primary dropdown-toggle"
              type="button"
              id="bmdSessionActions"
              dataToggle="dropdown"
              hasPopup={true}
            />
            <div className="dropdown-menu dropdown-menu-right">
              <span className="dropdown-header">Reporting</span>
              <Button
                className="dropdown-item"
                onClick={() => downloadExcel()}
                icon="file-excel"
                text="Download data"
              />
              <Button
                className="dropdown-item"
                onClick={() => downloadWord()}
                icon="file-word"
                text="Download report"
              />
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-12" style={{ maxWidth: 500 }}>
            <br></br>
            <Table
              data={{
                headers: ["Metric", "Value"],
                rows: labels.map((label) => [label, df[label]]),
                tblClasses:
                  "table table-sm table-striped table-hover text-right",
              }}
            />
          </div>
          <div className="col-12 d-flex flex-row-reverse">
            <ClipboardButton
              text="Copy results to clipboard"
              textToCopy={clipboardData}
              onCopy={(_e) => {
                alert(
                  "Jonckheere-Terpstra Trend Test results copied to clipboard!",
                );
              }}
              className="btn btn-link my-1"
            />
          </div>
        </div>
      </>
    );
  }
}
OutputTabs.propTypes = {
  store: PropTypes.object,
};

export default OutputTabs;
