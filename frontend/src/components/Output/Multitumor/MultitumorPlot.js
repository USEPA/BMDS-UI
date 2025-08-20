import _ from "lodash";
import {inject, observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";

import DoseResponsePlot from "@/components/common/DoseResponsePlot";
import {
    black,
    colorCodes,
    getBmdDiamond,
    getCsfLine,
    getDrLayout,
    getResponse,
} from "@/constants/plotting";

const getLayout = datasets => {
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

const getData = (ma, datasets, models) => {
    // models may be undefined; make sure to filter out prior to plotting
    const data = [];
    const y0 = _.mean(
        models.filter(d => _.isObject(d)).map(model => model.results.plotting.dr_y[0])
    );
    const y1 = y0 + ma.bmdl * ma.slope_factor;

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
        if (_.isEmpty(model)) {
            return;
        }
        const dataset = datasets[index];
        const {results} = model;
        data.push({
            x: results.plotting.dr_x,
            y: results.plotting.dr_y,
            line: {
                width: 3,
                color: colorCodes[index],
            },
            legendgroup: index,
            name: `${dataset.metadata.name} ${model.name}`,
        });
    });

    if (ma.bmdl) {
        data.push(getBmdDiamond("Cancer Slope Factor", ma.bmd, ma.bmdl, ma.bmdu, y1, black));
        data.push(getCsfLine(y0, ma.bmdl, y1, black));
    }
    return data;
};

@inject("outputStore")
@observer
class MultitumorPlot extends Component {
    render() {
        const store = this.props.outputStore;
        const layout = getLayout(store.multitumorDatasets);
        const data = getData(
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
