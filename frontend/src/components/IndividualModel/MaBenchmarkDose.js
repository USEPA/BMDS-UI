import {observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";

import {ff} from "@/utils/formatters";

import TwoColumnTable from "../common/TwoColumnTable";

@observer
class MaBenchmarkDose extends Component {
    render() {
        const {results} = this.props,
            data = [
                ["BMD", ff(results.bmd)],
                ["BMDL", ff(results.bmdl)],
                ["BMDU", ff(results.bmdu)],
            ];
        return <TwoColumnTable id="ma-result-summary" label="Summary" data={data} />;
    }
}
MaBenchmarkDose.propTypes = {
    results: PropTypes.object.isRequired,
};
export default MaBenchmarkDose;
