import _ from "lodash";
import {inject, observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import Plot from "react-plotly.js";

import ClipboardButton from "@/components/common/ClipboardButton";
import DataFrameTable from "@/components/common/DataFrameTable";

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
                    <DataFrameTable
                        data={df2}
                        columns={[
                            "dose",
                            "n",
                            "adj_n",
                            "incidence",
                            "proportion",
                            "adj_proportion",
                        ]}
                        formatters={{
                            adj_n: v => v.toFixed(4),
                            adj_proportion: v => v.toFixed(4),
                        }}
                    />
                    <div className="d-flex flex-row-reverse">
                        <ClipboardButton
                            text="Copy Data for BMDS Modeling"
                            textToCopy={copyText}
                            onCopy={e => {
                                alert(
                                    'Data copied to your clipboard! You can paste into Excel, or paste into an a BMDS analysis creating a new dataset and pressing the "Load dataset from Excel" button.'
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
                    <DataFrameTable
                        data={df2}
                        columns={[
                            "dose",
                            "n",
                            "adj_n",
                            "incidence",
                            "proportion",
                            "adj_proportion",
                        ]}
                        formatters={{
                            adj_n: v => v.toFixed(4),
                            adj_proportion: v => v.toFixed(4),
                        }}
                    />
                </Tab>
                <Tab eventKey="data" title="Data" style={{maxHeight: "50vh", overflowY: "scroll"}}>
                    <DataFrameTable
                        data={df}
                        columns={["dose", "day", "has_tumor", "weight"]}
                        formatters={{
                            weight: v => v.toFixed(4),
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
