import _ from "lodash";
import {inject, observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import Plot from "react-plotly.js";

import Button from "@/components/common/Button";
import Table from "@/components/common/Table";

@inject("store")
@observer
class SummaryPlots extends Component {
    render() {
        const {df} = this.props.store.outputs;
        return (
            <div className="row">
                <div className="col-lg-6">
                    <Plot
                        data={[
                            {
                                x: df.dose,
                                y: df.incidence,
                                type: "scatter",
                                mode: "lines+markers",
                                marker: {color: "MidnightBlue"},
                                name: "Original Incidence",
                            },
                            {
                                x: df.dose,
                                y: df.scaled_incidence,
                                type: "scatter",
                                mode: "lines+markers",
                                marker: {color: "LightSkyBlue"},
                                name: "Adjusted Incidence",
                            },
                        ]}
                        layout={{
                            height: 400,
                            hovermode: "x unified",
                            title: "Original Incidence vs Adjusted Incidence",
                            legend: {
                                x: 0.03,
                                y: 1,
                            },
                            xaxis: {
                                title: {
                                    text: "Dose",
                                },
                            },
                            yaxis: {
                                title: {
                                    text: "Incidence",
                                },
                            },
                        }}
                        style={{width: "100%"}}
                        useResizeHandler={true}
                    />
                </div>
                <div className="col-lg-6">
                    <Plot
                        data={[
                            {
                                x: df.dose,
                                y: df.n,
                                type: "scatter",
                                mode: "lines+markers",
                                marker: {color: "LightSeaGreen"},
                                name: "Original N",
                            },
                            {
                                x: df.dose,
                                y: df.scaled_n,
                                type: "scatter",
                                mode: "lines+markers",
                                marker: {color: "Aquamarine"},
                                name: "Adjusted N",
                            },
                        ]}
                        layout={{
                            height: 400,
                            hovermode: "x unified",
                            title: "Original N vs Adjusted N",
                            legend: {
                                x: 0.03,
                                y: 1,
                            },
                            xaxis: {
                                title: {
                                    text: "Dose",
                                },
                            },
                            yaxis: {
                                title: {
                                    text: "N",
                                },
                            },
                        }}
                        style={{width: "100%"}}
                        useResizeHandler={true}
                    />
                </div>
            </div>
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
        const {outputs, downloadExcel, downloadWord} = this.props.store,
            {df} = outputs;
        return (
            <>
                <div className="d-flex">
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
                <Tabs
                    defaultActiveKey="summary"
                    className="mb-3"
                    onSelect={() => {
                        // trigger resize event for plots
                        window.dispatchEvent(new Event("resize"));
                    }}>
                    <Tab eventKey="summary" title="Summary" className="container">
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
                                        df.scaled_n[i].toFixed(4),
                                        df.incidence[i],
                                        df.scaled_incidence[i].toFixed(4),
                                        (df.scaled_incidence[i] / df.scaled_n[i]).toFixed(3),
                                    ]),
                                    tblClasses:
                                        "table table-sm table-striped table-hover text-right",
                                }}
                            />
                        </div>
                        <SummaryPlots />
                    </Tab>
                    <Tab eventKey="data" title="Data">
                        ...
                    </Tab>
                </Tabs>
            </>
        );
    }
}
OutputTabs.propTypes = {
    store: PropTypes.object,
};

export default OutputTabs;
