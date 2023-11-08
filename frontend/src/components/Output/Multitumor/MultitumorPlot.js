import {inject, observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";

import DoseResponsePlot from "@/components/common/DoseResponsePlot";
import {getNameFromDegrees} from "@/constants/modelConstants";
import {colorCodes, getBmdDiamond, getDrLayout, getResponse} from "@/constants/plotting";

const getLayout = function(datasets) {
    let layout;
    datasets.forEach(dataset => {
        if (layout === undefined) {
            layout = getDrLayout(dataset);
            layout.title.text = "Multitumor";
            layout.yaxis.range = [0, 1];
        } else {
            const revised = getDrLayout(dataset);
            if (revised.xaxis.range[0] < layout.xaxis.range[0]) {
                layout.xaxis.range[0] = revised.xaxis.range[0];
            }
            if (revised.xaxis.range[1] > layout.xaxis.range[1]) {
                layout.xaxis.range[1] = revised.xaxis.range[1];
            }
        }
    });
    return layout;
};

const getData = function(ma, datasets, models) {
    const data = [],
        bmd_y = ma.bmdl * ma.slope_factor;

    // add individual datasets
    datasets.forEach((dataset, index) => {
        data.push({
            x: dataset.doses.slice(),
            y: getResponse(dataset).slice(),
            mode: "markers",
            type: "scatter",
            marker: {
                size: 12,
                color: "rgba(0,0,0,0)",
                line: {color: colorCodes[index], width: 2},
            },
            legendgroup: index,
            showlegend: false,
        });
    });

    // add selected models
    models.forEach((model, index) => {
        let dataset = datasets[index];
        data.push({
            x: model.plotting.dr_x,
            y: model.plotting.dr_y,
            line: {
                width: 3,
                color: colorCodes[index],
            },
            legendgroup: index,
            name: `${dataset.metadata.name} ${getNameFromDegrees(model)}`,
        });
    });

    if (ma.bmdl) {
        // add slope factor
        data.push({
            x: [0, ma.bmdl],
            y: [0, bmd_y],
            name: "Cancer Slope Factor",
            legendgroup: "Cancer Slope Factor",
            line: {
                width: 5,
                color: "#000000",
                dash: "dot",
            },
        });
        data.push(getBmdDiamond("Cancer Slope Factor", ma.bmd, ma.bmdl, ma.bmdu, bmd_y, "#000000"));
    }

    return data;
};

@inject("outputStore")
@observer
class MultitumorPlot extends Component {
    render() {
        const store = this.props.outputStore,
            layout = getLayout(store.multitumorDatasets),
            data = getData(
                store.selectedFrequentist.results,
                store.multitumorDatasets,
                store.selectedMultitumorModels
            );

        return <DoseResponsePlot data={data} layout={layout} />;
    }
}
MultitumorPlot.propTypes = {
    outputStore: PropTypes.object,
};
export default MultitumorPlot;
