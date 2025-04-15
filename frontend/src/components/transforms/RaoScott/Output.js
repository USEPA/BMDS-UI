import _ from "lodash";
import {inject, observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";
import Plot from "react-plotly.js";

import Button from "@/components/common/Button";
import ClipboardButton from "@/components/common/ClipboardButton";
import Table from "@/components/common/Table";
import {wrapText} from "@/utils/wrapText";

const plotLayout = (title, xAxis, yAxis) => {
    return {
        height: 400,
        margin: {l: 50, r: 5, t: 75, b: 55},
        hovermode: "x unified",
        title: {text: wrapText(title, 45)},
        legend: {x: 0.1, y: 1},
        xaxis: {title: {text: xAxis}},
        yaxis: {title: {text: yAxis}},
    };
};

@inject("store")
@observer
class SummaryPlots extends Component {
    render() {
        const {df} = this.props.store.outputs;
        return (
            <>
                <div className="col-lg-6">
                    <Plot
                        data={[
                            {
                                x: df.dose,
                                y: df.n,
                                type: "scatter",
                                mode: "lines+markers",
                                marker: {color: "FireBrick", symbol: "circle", size: 12},
                                name: "Original N",
                            },
                            {
                                x: df.dose,
                                y: df.n_adjusted,
                                type: "scatter",
                                mode: "lines+markers",
                                marker: {color: "LightSalmon", symbol: "diamond", size: 12},
                                name: "Adjusted N",
                            },
                        ]}
                        layout={plotLayout("Original N vs Adjusted N", "Dose", "N")}
                        style={{width: "100%"}}
                        useResizeHandler={true}
                    />
                </div>
                <div className="col-lg-6">
                    <Plot
                        data={[
                            {
                                x: df.dose,
                                y: df.incidence,
                                type: "scatter",
                                mode: "lines+markers",
                                marker: {color: "MidnightBlue", symbol: "circle", size: 12},
                                name: "Original Incidence",
                            },
                            {
                                x: df.dose,
                                y: df.incidence_adjusted,
                                type: "scatter",
                                mode: "lines+markers",
                                marker: {color: "LightSkyBlue", symbol: "diamond", size: 12},
                                name: "Adjusted Incidence",
                            },
                        ]}
                        layout={plotLayout(
                            "Original Incidence vs Adjusted Incidence",
                            "Dose",
                            "Incidence"
                        )}
                        style={{width: "100%"}}
                        useResizeHandler={true}
                    />
                </div>
            </>
        );
    }
}
SummaryPlots.propTypes = {
    store: PropTypes.object,
};

@inject("store")
@observer
class OutputTabs extends Component {
    render() {
        const {outputs, downloadExcel, downloadWord, clipboardData} = this.props.store,
            {df} = outputs;
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
                    <div className="col-12">
                        <Table
                            data={{
                                headers: [
                                    "Dose",
                                    "Original N",
                                    "Adjusted N",
                                    "Original Incidence",
                                    "Adjusted Incidence",
                                    "Fraction Affected",
                                ],
                                rows: _.range(df.dose.length).map(i => [
                                    df.dose[i],
                                    df.n[i],
                                    df.n_adjusted[i].toFixed(4),
                                    df.incidence[i],
                                    df.incidence_adjusted[i].toFixed(4),
                                    df.fraction_affected[i].toFixed(3),
                                ]),
                                tblClasses: "table table-sm table-striped table-hover text-right",
                            }}
                        />
                    </div>
                    <div className="col-12 d-flex flex-row-reverse">
                        <ClipboardButton
                            text="Copy Data for BMDS Modeling"
                            textToCopy={clipboardData}
                            onCopy={e => {
                                alert(
                                    'Data copied to your clipboard! For your dichotomous analysis, return to the Data tab, select the "Load dataset from Excel" button, and paste the clipboard contents to create a new dataset. Or, paste the clipboard contents into Excel for further analysis.'
                                );
                            }}
                            className="btn btn-link my-1"
                        />
                    </div>
                    <SummaryPlots />
                </div>
            </>
        );
    }
}
OutputTabs.propTypes = {
    store: PropTypes.object,
};

export default OutputTabs;
