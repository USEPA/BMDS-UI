import PropTypes from "prop-types";
import React, {Component} from "react";
import ReactDOM from "react-dom";
import Plot from "react-plotly.js";

class PlotlyFigure extends Component {
    render() {
        const {data, layout} = this.props;
        return (
            <Plot
                data={data}
                layout={layout}
                style={{height: "100%", width: "100%"}}
                useResizeHandler={true}
            />
        );
    }
}
PlotlyFigure.propTypes = {
    data: PropTypes.array,
    layout: PropTypes.object,
};

const renderPlotlyFigure = (el, data) => {
    ReactDOM.render(<PlotlyFigure {...data} />, el);
};

export {renderPlotlyFigure};
export default PlotlyFigure;
