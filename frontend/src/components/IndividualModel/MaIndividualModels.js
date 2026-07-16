import {observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";

import FloatingPointHover from "@/components/common/FloatingPointHover";
import Table from "@/components/common/Table";
import {ff} from "@/utils/formatters";

@observer
class MaIndividualModels extends Component {
    render() {
        const {model_average, models, bmdSummary, isLOUD} = this.props;

        // loud table setup
        const hasRhat = bmdSummary && "R-hat" in bmdSummary;
        const METRICS = isLOUD
            ? [
                  "BMD",
                  "BMDL",
                  "BMDU",
                  ...(hasRhat ? ["R-hat"] : []),
                  "Markov Chain Standard Error (Median)",
                  "Bulk Effective Sample Size",
                  "Tail Effective Sample Size",
              ]
            : null;

        const modelRows = isLOUD
            ? models.map(model => [
                  model.name,
                  ff(model_average.priors[models.indexOf(model)]),
                  ff(model_average.posteriors[models.indexOf(model)]),
                  ...METRICS.map((metric, i) => (
                      <FloatingPointHover key={i} value={bmdSummary?.[metric]?.[model.name]} />
                  )),
              ])
            : models.map((model, i) => [
                  model.name,
                  ff(model_average.priors[i]),
                  ff(model_average.posteriors[i]),
                  <FloatingPointHover key={1} value={model.results.bmdl} />,
                  <FloatingPointHover key={2} value={model.results.bmd} />,
                  <FloatingPointHover key={3} value={model.results.bmdu} />,
              ]);

        const maRow = isLOUD
            ? [
                  "Model Average",
                  "-",
                  "-",
                  ...METRICS.map((metric, i) => (
                      <FloatingPointHover key={i} value={bmdSummary?.[metric]?.["MA_BMD"]} />
                  )),
              ]
            : null;

        const data = isLOUD
            ? {
                  headers: ["Model", "Prior Weights", "Posterior Probability", ...METRICS],
                  colWidths: hasRhat
                      ? [17, 8, 9, 8, 8, 8, 8, 12, 11, 11]
                      : [18, 9, 10, 9, 9, 9, 12, 12, 12],
                  subheader: "Individual Model Results",
                  tblClasses: "table table-sm text-right col-l-1",
                  rows: [...modelRows, maRow],
              }
            : {
                  headers: [
                      "Model",
                      "Prior Weights",
                      "Posterior Probability",
                      "BMDL",
                      "BMD",
                      "BMDU",
                  ],
                  colWidths: [18, 18, 18, 17, 17, 17],
                  subheader: "Individual Model Results",
                  tblClasses: "table table-sm text-right col-l-1",
                  rows: modelRows,
              };

        const table = isLOUD ? (
            <div style={{marginTop: "20px"}}>
                <Table data={data} />
                {!hasRhat && (
                    <div style={{marginBottom: "20px", position: "relative", top: "-10px"}}>
                        <i>
                            NOTE: R-hat statistic is calculated only when more than 1 Markov chain
                            is used
                        </i>
                    </div>
                )}
            </div>
        ) : (
            <Table data={data} />
        );

        return table;
    }
}
MaIndividualModels.propTypes = {
    model_average: PropTypes.object.isRequired,
    models: PropTypes.array.isRequired,
    bmdSummary: PropTypes.object,
    isLOUD: PropTypes.bool.isRequired,
};
export default MaIndividualModels;
