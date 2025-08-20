import _ from "lodash";

import {continuousErrorBars, dichotomousErrorBars} from "@/utils/errorBars";
import {ff} from "@/utils/formatters";
import {wrapText} from "@/utils/wrapText";

import {Dtype} from "./dataConstants";

const doseResponseLayout = {
    autosize: true,
    legend: {yanchor: "top", y: 0.99, xanchor: "left", x: 0.01},
    margin: {l: 50, r: 5, t: 50, b: 55},
    showlegend: true,
    title: {
        text: "ADD",
    },
    xaxis: {
        title: {
            text: "ADD",
        },
    },
    yaxis: {
        title: {
            text: "ADD",
        },
    },
};
const hexToRgbA = (hex, alpha) => {
    let c;
    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
        c = hex.substring(1).split("");
        if (c.length === 3) {
            c = [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c = `0x${c.join("")}`;
        return `rgba(${[(c >> 16) & 255, (c >> 8) & 255, c & 255].join(",")},${alpha})`;
    }
    throw new Error("Bad Hex");
};

export const getResponse = dataset => {
        let incidences;
        let ns;

        switch (dataset.dtype) {
            case Dtype.CONTINUOUS:
                return dataset.means;
            case Dtype.CONTINUOUS_INDIVIDUAL:
                return dataset.responses;
            case Dtype.DICHOTOMOUS:
                ns = dataset.ns;
                incidences = dataset.incidences;
                return _.range(ns.length).map(idx => incidences[idx] / ns[idx]);
            case Dtype.NESTED_DICHOTOMOUS:
                ns = dataset.litter_ns;
                incidences = dataset.incidences;
                return _.range(ns.length).map(idx => incidences[idx] / ns[idx]);
            default:
                throw `Unknown dtype: ${dataset.dtype}`;
        }
    },
    getDoseLabel = dataset => {
        let label = dataset.metadata.dose_name;
        if (dataset.metadata.dose_units) {
            label = `${label} (${dataset.metadata.dose_units})`;
        }
        return label;
    },
    getResponseLabel = dataset => {
        let label = dataset.metadata.response_name;
        if (dataset.metadata.response_units) {
            label = `${label} (${dataset.metadata.response_units})`;
        }
        return label;
    },
    getDrLayout = (dataset, _selected, _modal, _hover) => {
        const layout = _.cloneDeep(doseResponseLayout);
        layout.title.text = wrapText(dataset.metadata.name, 45, "<br>");
        layout.xaxis.title.text = getDoseLabel(dataset);
        layout.yaxis.title.text = getResponseLabel(dataset);
        const xmin = _.min(dataset.doses) || 0;
        const xmax = _.max(dataset.doses) || 0;
        const response = getResponse(dataset);
        const ymin =
            dataset.dtype === Dtype.CONTINUOUS
                ? _.min(response) - _.max(continuousErrorBars(dataset).array)
                : _.min(response) || 0;
        const ymax =
            dataset.dtype === Dtype.CONTINUOUS
                ? _.max(response) + _.max(continuousErrorBars(dataset).array)
                : _.max(response) || 0;
        const xbuff = Math.abs(xmax - xmin) * 0.05;
        const ybuff = Math.abs(ymax - ymin) * 0.05;

        layout.xaxis.range = [
            xmin === 0 ? -xbuff : xmin - xbuff,
            xmax === 0 ? xbuff : xmax + xbuff,
        ];
        layout.yaxis.range =
            dataset.dtype === Dtype.DICHOTOMOUS || dataset.dtype === Dtype.NESTED_DICHOTOMOUS
                ? [-0.05, 1.05]
                : [ymin === 0 ? -ybuff : ymin - ybuff, ymax === 0 ? ybuff : ymax + ybuff];

        // determine whether to position legend to the left or right; auto doesn't work
        const maxResponseIndex = response.indexOf(_.max(response));
        const maxResponseDose = dataset.doses[maxResponseIndex];
        const doseRange = _.max(dataset.doses) - _.min(dataset.doses);

        if (maxResponseDose < doseRange / 2) {
            layout.legend.xanchor = "right";
            layout.legend.x = 1;
        } else {
            layout.legend.xanchor = "left";
            layout.legend.x = 0.05;
        }
        return layout;
    },
    getCdfLayout = (dataset, xs) => {
        const layout = _.cloneDeep(doseResponseLayout);
        layout.title.text = "BMD Cumulative Distribution Function (CDF)";
        layout.xaxis.title.text = getDoseLabel(dataset);
        layout.yaxis.title.text = "Cumulative Probability";
        layout.yaxis.range = [0, 1];
        const xMax = xs[xs.length - 1];
        const xMin = xs[0];
        const xPadding = (xMax - xMin) * 0.025;
        layout.xaxis.range = [xMin - xPadding, xMax + xPadding];
        layout.legend.traceorder = "reversed";
        return layout;
    },
    getDrDatasetPlotData = dataset => {
        let errorBars;
        let hovertemplate;
        let name;
        if (dataset.dtype === Dtype.CONTINUOUS) {
            errorBars = continuousErrorBars(dataset);
            name = "Observed Mean ± 95% CI";
        } else if (dataset.dtype === Dtype.CONTINUOUS_INDIVIDUAL) {
            name = "Observed";
        } else if (dataset.dtype === Dtype.DICHOTOMOUS) {
            errorBars = dichotomousErrorBars(dataset);
            name = "Fraction Affected ± 95% CI";
        } else if (dataset.dtype === Dtype.NESTED_DICHOTOMOUS) {
            name = "Fraction Affected";
        }
        if (errorBars) {
            hovertemplate = "%{y:.3f} (%{customdata[0]:.3f}, %{customdata[1]:.3f})<extra></extra>";
        }
        return {
            x: dataset.doses.slice(),
            y: getResponse(dataset).slice(),
            mode: "markers",
            type: "scatter",
            marker: {
                size: 10,
            },
            error_y: errorBars,
            customdata: errorBars ? errorBars.bounds : undefined,
            hovertemplate,
            name,
        };
    },
    getBmdDiamond = (name, bmd, bmdl, bmdu, bmd_y, hexColor) => {
        const hasBmd = bmd > 0;

        // prettier-ignore
        const template = `<b>${name}</b><br />BMD: ${ff(bmd)}<br />BMDL: ${ff(bmdl)}<br />BMDU: ${ff(bmdu)}<br />BMR: ${ff(bmd_y)}<extra></extra>`;

        if (hasBmd) {
            return {
                x: [bmd],
                y: [bmd_y],
                mode: "markers",
                type: "scatter",
                hoverinfo: "x",
                hovertemplate: template,
                marker: {
                    color: hexColor,
                    size: 16,
                    symbol: "diamond-tall",
                    line: {
                        color: "white",
                        width: 2,
                    },
                },
                legendgroup: name,
                showlegend: false,
                error_x: {
                    array: [bmdu > 0 ? bmdu - bmd : 0],
                    arrayminus: [bmdl > 0 ? bmd - bmdl : 0],
                    color: hexToRgbA(hexColor, 0.6),
                    thickness: 12,
                    width: 0,
                },
            };
        }
    },
    getCsfLine = (y0, bmdl, bmd_y, hexColor) => {
        if (bmdl > 0) {
            return {
                x: [0, bmdl],
                y: [y0, bmd_y],
                name: "Cancer Slope Factor",
                legendgroup: "Cancer Slope Factor",
                line: {
                    width: 5,
                    color: hexToRgbA(hexColor, 0.7),
                    dash: "dot",
                },
            };
        }
    },
    getDrBmdLine = (model, hexColor) => {
        // https://plotly.com/python/marker-style/
        // https://plotly.com/javascript/reference/scatter/
        const data = [
            {
                x: model.results.plotting.dr_x,
                y: model.results.plotting.dr_y,
                mode: "lines",
                name: model.name,
                hoverinfo: "y",
                line: {
                    color: hexToRgbA(hexColor, 0.8),
                    width: 4,
                    opacity: 0.5,
                },
                legendgroup: model.name,
            },
        ];

        const diamond = getBmdDiamond(
            model.name,
            model.results.bmd,
            model.results.bmdl,
            model.results.bmdu,
            model.results.plotting.bmd_y,
            hexColor
        );
        if (diamond) {
            data.push(diamond);
        }
        return data;
    },
    getBayesianBMDLine = (model, hexColor) => {
        const data = [
            {
                x: model.results.dr_x,
                y: model.results.dr_y,
                name: "Model Average",
                legendgroup: "Model Average",
                line: {
                    width: 6,
                    color: hexColor,
                },
            },
        ];

        const diamond = getBmdDiamond(
            "Model Average",
            model.results.bmd,
            model.results.bmdl,
            model.results.bmdu,
            model.results.bmd_y,
            hexColor
        );
        if (diamond) {
            data.push(diamond);
        }

        return data;
    },
    getConfig = () => ({
        modeBarButtonsToRemove: [
            "pan2d",
            "select2d",
            "lasso2d",
            "zoomIn2d",
            "zoomOut2d",
            "autoScale2d",
            "hoverClosestCartesian",
            "hoverCompareCartesian",
            "toggleSpikelines",
        ],
    }),
    bmaColor = "#00008b",
    hoverColor = "#DA2CDA",
    selectedColor = "#4a9f2f",
    black = "#000000",
    colorCodes = [
        // adapted from https://observablehq.com/@d3/color-schemes
        "#e41a1c",
        "#377eb8",
        "#4daf4a",
        "#984ea3",
        "#ff7f00",
        "#edc949",
        "#a65628",
        "#f781bf",
        "#999999",
        "#e41a1c",
        "#377eb8",
        "#4daf4a",
        "#984ea3",
        "#ff7f00",
        "#edc949",
        "#a65628",
        "#f781bf",
        "#999999",
    ];
