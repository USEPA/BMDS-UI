import _ from "lodash";
import {inject, observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import Plot from "react-plotly.js";

import ClipboardButton from "@/components/common/ClipboardButton";
import Table from "@/components/common/Table";

const summaryTable = function(df) {
    return (
        <Table
            data={{
                headers: [
                    "Dose",
                    "N",
                    "Adjusted N",
                    "Incidence",
                    "Proportion",
                    "Adjusted Proportion",
                ],
                rows: _.range(df.dose.length).map(i => [
                    df.dose[i],
                    df.n[i],
                    df.adj_n[i].toFixed(4),
                    df.incidence[i],
                    df.proportion[i],
                    df.adj_proportion[i].toFixed(4),
                ]),
                tblClasses: "table table-sm table-striped table-hover text-right",
            }}
        />
    );
};

@inject("store")
@observer
class SummaryPlot extends Component {
    render() {
        const {df2} = this.props.store.outputs,
            {dose_units} = this.props.store.settings;
        return (
            <Plot
                data={[
                    {
                        x: df2.dose,
                        y: df2.proportion,
                        type: "scatter",
                        mode: "lines+markers",
                        marker: {color: "blue"},
                        name: "Original Proportion",
                    },
                    {
                        x: df2.dose,
                        y: df2.adj_proportion,
                        type: "scatter",
                        mode: "lines+markers",
                        marker: {color: "red"},
                        name: "Adjusted Proportion",
                    },
                ]}
                layout={{
                    height: 400,
                    title: "Adjusted Proportion vs Original Proportion",
                    legend: {
                        x: 0.03,
                        y: 1,
                    },
                    xaxis: {
                        title: {
                            text: `Dose (${dose_units})`,
                        },
                    },
                    yaxis: {
                        title: {
                            text: "Proportion (%)",
                        },
                    },
                }}
                style={{width: "100%"}}
                useResizeHandler={true}
            />
        );
    }
}
SummaryPlot.propTypes = {
    store: PropTypes.object,
};

@inject("store")
@observer
class RawDataPlot extends Component {
    getData(df) {
        const d1 = _.zip(df.dose, df.day, df.has_tumor),
            d2 = _.groupBy(d1, arr => arr[0]);
        let results = [];
        _.each(d2, (values, key) => {
            const arr1 = [],
                arr2 = [];
            let cumulative = 0;

            _.each(values, arr => {
                if (arr[2] == 1) {
                    cumulative += 1;
                }
                arr1.push(arr[1]);
                arr2.push(cumulative);
            });
            results.push([key, arr1, arr2]);
        });
        return _.sortBy(results, arr => arr[0]);
    }
    render() {
        const {df} = this.props.store.outputs,
            data = this.getData(df),
            {dose_units} = this.props.store.settings;
        return (
            <Plot
                data={data.map(row => {
                    return {
                        x: row[1],
                        y: row[2],
                        name: `${row[0]} ${dose_units}`,
                        type: "scatter",
                        mode: "lines+markers",
                    };
                })}
                layout={{
                    height: 400,
                    title: "Tumor incidence over study duration",
                    legend: {
                        x: 0.03,
                        y: 1,
                    },
                    xaxis: {
                        title: {
                            text: "Study duration (days)",
                        },
                    },
                    yaxis: {
                        title: {
                            text: "Cumulative tumor incidence",
                        },
                    },
                }}
                style={{width: "100%"}}
                useResizeHandler={true}
            />
        );
    }
}
RawDataPlot.propTypes = {
    store: PropTypes.object,
};

@inject("store")
@observer
class OutputTabs extends Component {
    render() {
        const {df, df2} = this.props.store.outputs,
            copyText = _.zip(df2.dose, df2.adj_n, df2.incidence)
                .map(d => `${d[0]}\t${d[1].toFixed(4)}\t${d[2]}`)
                .join("\n");
        df["weight"] = df["adj_n"];
        return (
            <Tabs
                defaultActiveKey="summary"
                className="mb-3"
                onSelect={() => {
                    // trigger resize event for plots
                    window.dispatchEvent(new Event("resize"));
                }}>
                <Tab eventKey="summary" title="Summary">
                    {summaryTable(df2)}
                    <div className="d-flex flex-row-reverse">
                        <ClipboardButton
                            text="Copy Data for BMDS Modeling"
                            textToCopy={copyText}
                            onCopy={e => {
                                alert(
                                    'Data copied to your clipboard! For your Multistage/Multitumor analysis, return to the Data tab, select the "Load dataset from Excel" button, and paste the clipboard contents to create a new dataset. Or, paste the clipboard contents into Excel for further analysis.'
                                );
                            }}
                            className="btn btn-link my-1"
                        />
                    </div>
                    <SummaryPlot />
                </Tab>
                <Tab eventKey="plots" title="Plots">
                    <RawDataPlot />
                </Tab>
                <Tab eventKey="table" title="Table">
                    {summaryTable(df2)}
                </Tab>
                <Tab eventKey="data" title="Data" style={{maxHeight: "70vh", overflowY: "scroll"}}>
                    <Table
                        data={{
                            headers: ["Dose", "Day", "Has Tumor", "Weight"],
                            rows: _.range(df.dose.length).map(i => [
                                df.dose[i],
                                df.day[i],
                                df.has_tumor[i],
                                df.weight[i].toFixed(4),
                            ]),
                            tblClasses: "table table-sm table-striped table-hover text-right",
                        }}
                    />
                </Tab>
            </Tabs>
        );
    }
}
OutputTabs.propTypes = {
    store: PropTypes.object,
};

export default OutputTabs;
