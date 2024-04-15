import {observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";

import {ff, fractionalFormatter} from "@/utils/formatters";

@observer
class AnalysisOfDeviance extends Component {
    render() {
        const {model} = this.props,
            deviances = model.results.deviance;
        return (
            <table className="table table-sm table-bordered text-right col-l-1">
                <colgroup>
                    <col width="20%" />
                    <col width="16%" />
                    <col width="16%" />
                    <col width="16%" />
                    <col width="16%" />
                    <col width="16%" />
                </colgroup>
                <thead>
                    <tr className="bg-custom">
                        <th colSpan="9">Analysis of Deviance</th>
                    </tr>
                    <tr>
                        <th>Model</th>
                        <th>-2* Log(Likelihood Ratio)</th>
                        <th># Parameters</th>
                        <th>Deviance</th>
                        <th>Test d.f.</th>
                        <th>
                            <i>P</i>-Value
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {deviances.names.map((name, i) => {
                        return (
                            <tr key={i}>
                                <td>{name}</td>
                                <td>{ff(deviances.ll[i])}</td>
                                <td>{deviances.params[i]}</td>
                                <td>{ff(deviances.deviance[i])}</td>
                                <td>{ff(deviances.df[i])}</td>
                                <td>{fractionalFormatter(deviances.p_value[i])} </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        );
    }
}
AnalysisOfDeviance.propTypes = {
    model: PropTypes.object,
};
export default AnalysisOfDeviance;
