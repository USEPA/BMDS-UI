import {observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";

import FloatingPointHover from "@/components/common/FloatingPointHover";
import Table from "@/components/common/Table";
import {ff} from "@/utils/formatters";

@observer
class MaIndividualModels extends Component {
    render() {
        const {model_average, models, bmdSummary} = this.props,
            hasRhat = bmdSummary && "R-hat" in bmdSummary,
            METRICS = [
                "BMD",
                "BMDL",
                "BMDU",
                ...(hasRhat ? ["R-hat"] : []),
                "Markov Chain Standard Error (Median)",
                "Bulk Effective Sample Size",
                "Tail Effective Sample Size",
            ],
            modelRows = models.map(model => [
                model.name,
                ff(model_average.priors[models.indexOf(model)]),
                ff(model_average.posteriors[models.indexOf(model)]),
                ...METRICS.map((metric, i) => (
                    <FloatingPointHover key={i} value={bmdSummary?.[metric]?.[model.name]} />
                )),
            ]),
            maRow = [
                "Model Average",
                "-",
                "-",
                ...METRICS.map((metric, i) => (
                    <FloatingPointHover key={i} value={bmdSummary?.[metric]?.["MA_BMD"]} />
                )),
            ],
            data = {
                headers: ["Model", "Prior Weights", "Posterior Probability", ...METRICS],
                colWidths: hasRhat
                    ? [17, 8, 9, 8, 8, 8, 8, 12, 11, 11]
                    : [18, 9, 10, 9, 9, 9, 12, 12, 12],
                subheader: "Individual Model Results",
                tblClasses: "table table-sm text-right col-l-1",
                rows: [...modelRows, maRow],
            };

        return (
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
        );
    }
}
MaIndividualModels.propTypes = {
    model_average: PropTypes.object.isRequired,
    models: PropTypes.array.isRequired,
    bmdSummary: PropTypes.object.isRequired,
};
export default MaIndividualModels;
