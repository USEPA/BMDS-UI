import {observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";

import Table from "@/components/common/Table";
import {ff} from "@/utils/formatters";

@observer
class ContinuousDeviance extends Component {
    render() {
        const {store} = this.props,
            deviances = store.modalModel.results.deviance,
            data = {
                headers: ["Model", "-2* Log(Likelihood Ratio)", "# of Parameters", "AIC"],
                rows: deviances.names.map((name, i) => [
                    name,
                    ff(deviances.loglikelihoods[i]),
                    deviances.num_params[i],
                    ff(deviances.aics[i]),
                ]),
                subheader: "Likelihoods",
                tblClasses: "table table-sm table-bordered text-right col-l-1",
            };
        return <Table data={data} />;
    }
}
ContinuousDeviance.propTypes = {
    store: PropTypes.object,
};
export default ContinuousDeviance;
