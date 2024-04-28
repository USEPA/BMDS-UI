import {observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";

import FloatingPointHover from "@/components/common/FloatingPointHover";
import Table from "@/components/common/Table";
import {ff} from "@/utils/formatters";

@observer
class MaIndividualModels extends Component {
    render() {
        const {model_average, models} = this.props,
            data = {
                headers: ["Model", "Prior Weights", "Posterior Probability", "BMDL", "BMD", "BMDU"],
                colWidths: [25, 15, 15, 15, 15, 15],
                subheader: "Individual Model Results",
                tblClasses: "table table-sm table-bordered text-right col-l-1",
                rows: models.map((model, i) => [
                    model.name,
                    ff(model_average.results.priors[i]),
                    ff(model_average.results.posteriors[i]),
                    <FloatingPointHover key={1} value={model.results.bmdl} />,
                    <FloatingPointHover key={2} value={model.results.bmd} />,
                    <FloatingPointHover key={3} value={model.results.bmdu} />,
                ]),
            };
        return <Table data={data} />;
    }
}
MaIndividualModels.propTypes = {
    model_average: PropTypes.object.isRequired,
    models: PropTypes.array.isRequired,
};
export default MaIndividualModels;
