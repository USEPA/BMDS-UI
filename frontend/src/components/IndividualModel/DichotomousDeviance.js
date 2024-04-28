import {observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";

import Table from "@/components/common/Table";
import {ff, fractionalFormatter} from "@/utils/formatters";

@observer
class DichotomousDeviance extends Component {
    render() {
        const {store} = this.props,
            deviances = store.modalModel.results.deviance,
            data = {
                colWidths: [20, 16, 16, 16, 16, 16],
                headers: [
                    "Model",
                    "Log-Likelihood",
                    "# Parameters",
                    "Deviance",
                    "Test d.f.",
                    <span key={0}>
                        <i>P</i>-Value
                    </span>,
                ],
                rows: deviances.names.map((name, i) => [
                    name,
                    ff(deviances.ll[i]),
                    deviances.params[i],
                    ff(deviances.deviance[i]),
                    ff(deviances.df[i]),
                    fractionalFormatter(deviances.p_value[i]),
                ]),
                subheader: "Analysis of Deviance",
                tblClasses: "table table-sm table-bordered text-right col-l-1",
            };
        return <Table data={data} />;
    }
}
DichotomousDeviance.propTypes = {
    store: PropTypes.object,
};
export default DichotomousDeviance;
