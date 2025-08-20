import _ from "lodash";
import {toJS} from "mobx";
import {observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";
import Plot from "react-plotly.js";

import {getCdfLayout, getConfig} from "@/constants/plotting";

@observer
class CDFPlot extends Component {
    render() {
        const {dataset, bmd, bmdl, bmdu, alpha} = this.props;
        const cdf = toJS(this.props.cdf);
        const layout = getCdfLayout(dataset, cdf[0]);
        const bmdlLabel = bmdl > 0 && bmdu > 0 ? "BMDL, BMDU" : bmdl > 0 ? "BMDL" : false;
        const bmduLabel = bmdl > 0 && bmdu > 0 ? false : bmdu > 0 ? "BMDU" : false;
        const data = _.compact([
            bmdl > 0
                ? {
                      x: [bmdl, bmdl],
                      y: [0, alpha],
                      mode: "lines",
                      type: "line",
                      line: {width: 3, color: "#ff7f00", dash: "dot"},
                      name: bmdlLabel,
                      showlegend: bmdlLabel !== false,
                  }
                : false,
            bmdu > 0
                ? {
                      x: [bmdu, bmdu],
                      y: [0, 1 - alpha],
                      mode: "lines",
                      type: "line",
                      line: {width: 3, color: "#ff7f00", dash: "dot"},
                      name: bmduLabel,
                      showlegend: bmduLabel !== false,
                  }
                : false,
            bmd > 0
                ? {
                      x: [bmd, bmd],
                      y: [0, 0.5],
                      mode: "lines",
                      type: "line",
                      line: {width: 3, color: "#ff7f00"},
                      name: "BMD",
                  }
                : false,
            {
                x: cdf[0],
                y: cdf[1],
                mode: "lines",
                type: "line",
                line: {
                    width: 4,
                    color: "#1f77b4",
                },
                name: "Model Probability",
            },
        ]);
        return (
            <Plot
                data={data}
                layout={layout}
                config={getConfig()}
                style={{width: "100%"}}
                useResizeHandler={true}
            />
        );
    }
}

CDFPlot.propTypes = {
    dataset: PropTypes.object,
    cdf: PropTypes.array,
    bmd: PropTypes.number,
    bmdl: PropTypes.number,
    bmdu: PropTypes.number,
    alpha: PropTypes.number,
};

export default CDFPlot;
