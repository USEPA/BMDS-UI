import _ from "lodash";
import PropTypes from "prop-types";
import React, {Component} from "react";

import FloatingPointHover from "@/components/common/FloatingPointHover";

class TwoColumnTable extends Component {
    render() {
        const {id, data, label, colwidths} = this.props,
            widths = colwidths.map(d => `${d}%`),
            formatPopover = function (value, raw_value) {
                return _.isFinite(raw_value) ? (
                    <FloatingPointHover value={raw_value} />
                ) : (
                    <span>{value}</span>
                );
            };
        return (
            <table id={id} className="table table-sm col-r-2">
                <colgroup>
                    <col width={widths[0]} />
                    <col width={widths[1]} />
                </colgroup>
                <thead>
                    <tr className="bg-custom">
                        <th colSpan="2">{label}</th>
                    </tr>
                </thead>
                <tbody>
                    {data.filter(_.isArrayLike).map((item, i) => (
                        <tr key={i}>
                            <td>{item[0]}</td>
                            <td>{formatPopover(item[1], item[2])}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    }
}
TwoColumnTable.propTypes = {
    id: PropTypes.string,
    data: PropTypes.array.isRequired,
    label: PropTypes.string.isRequired,
    colwidths: PropTypes.array,
};
TwoColumnTable.defaultProps = {
    colwidths: [40, 60],
};

export default TwoColumnTable;
