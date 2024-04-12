import {observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";

import FloatingPointHover from "@/components/common/FloatingPointHover";
import {ff, fourDecimalFormatter} from "@/utils/formatters";

@observer
class DichotomousSummary extends Component {
    render() {
        const {store} = this.props,
            results = store.modalModel.results;

        return (
            <table className="table table-sm table-bordered col-r-2">
                <colgroup>
                    <col width="60%" />
                    <col width="40%" />
                </colgroup>
                <thead>
                    <tr className="bg-custom">
                        <th colSpan="2">Modeling Summary</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>BMD</td>
                        <td>
                            <FloatingPointHover value={results.bmd} />
                        </td>
                    </tr>
                    <tr>
                        <td>BMDL</td>
                        <td>
                            <FloatingPointHover value={results.bmdl} />
                        </td>
                    </tr>
                    <tr>
                        <td>BMDU</td>
                        <td>
                            <FloatingPointHover value={results.bmdu} />
                        </td>
                    </tr>
                    <tr>
                        <td>AIC</td>
                        <td>
                            <FloatingPointHover value={results.fit.aic} />
                        </td>
                    </tr>
                    <tr>
                        <td>-2* Log(Likelihood Ratio)</td>
                        <td>{ff(results.fit.loglikelihood)}</td>
                    </tr>
                    <tr>
                        <td>
                            <i>P</i>-Value
                        </td>
                        <td>{fourDecimalFormatter(results.gof.p_value)}</td>
                    </tr>
                    <tr>
                        <td>Overall d.f.</td>
                        <td>{ff(results.gof.df)}</td>
                    </tr>
                    <tr>
                        <td>Chi²</td>
                        <td>{ff(results.fit.chisq)}</td>
                    </tr>
                </tbody>
            </table>
        );
    }
}

DichotomousSummary.propTypes = {
    store: PropTypes.object,
};

export default DichotomousSummary;
