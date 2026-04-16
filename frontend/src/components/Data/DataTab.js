import { inject, observer } from "mobx-react";
import PropTypes from "prop-types";
import React, { Component } from "react";

import DoseResponsePlot from "../common/DoseResponsePlot";
import DatasetForm from "./DatasetForm";
import DatasetSelector from "./DatasetSelector";
import DatasetTable from "./DatasetTable";
import SelectModelType from "./SelectModelType";
import Button from "../common/Button";
import Table from "../common/Table";

import { MODEL_DICHOTOMOUS } from "@/constants/mainConstants";

@inject("dataStore")
@observer
class Data extends Component {
  render() {
    const { dataStore } = this.props;
    const cochranArmitageLabels = [
      "Statistic",
      "P-Value (Asymptotic)",
      "P-Value (Exact) ",
    ];
    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-2">
            {dataStore.canEdit ? <SelectModelType /> : null}
            {dataStore.getDataLength ? (
              <DatasetSelector store={dataStore} />
            ) : null}
          </div>
          <div className="col-md-6">
            {dataStore.hasSelectedDataset ? (
              dataStore.canEdit ? (
                <DatasetForm />
              ) : (
                <DatasetTable dataset={dataStore.selectedDataset} />
              )
            ) : null}
          </div>
          <div className="col-md-4">
            {dataStore.hasSelectedDataset && (
              <>
                <DoseResponsePlot
                  layout={dataStore.drPlotLayout}
                  data={dataStore.drPlotData}
                />
                {dataStore.rootStore.mainStore.model_type ===
                  MODEL_DICHOTOMOUS && (
                  <div style={{ paddingTop: "2px" }}>
                    <Button
                      className="btn btn-primary"
                      text="Cochran-Armitage Test"
                      onClick={(e) => {
                        dataStore.performCochranArmitage();
                      }}
                    />
                    <div id="cochran-armitage-result">
                      {dataStore.CochranArmitageResult && (
                        <>
                          <div className="col-12" style={{ maxWidth: 500 }}>
                            <br></br>
                            <Table
                              data={{
                                headers: ["Metric", "Value"],
                                rows: cochranArmitageLabels.map((label) => [
                                  label,
                                  dataStore.CochranArmitageResult[label],
                                ]),
                                tblClasses:
                                  "table table-sm table-striped table-hover text-right",
                              }}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  }
}
Data.propTypes = {
  dataStore: PropTypes.object,
};
export default Data;
