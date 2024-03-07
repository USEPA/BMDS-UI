import _ from "lodash";
import PropTypes from "prop-types";
import React, {Component} from "react";

import LongFloatPopover from "@/components/common/LongFloatPopover";

class TwoColumnTable extends Component {
    render() {
        const {id, data, label, colwidths} = this.props,
            widths = colwidths.map(d => `${d}%`);
        const formatPopover = function(value) {
            let ff_val = value[1];
            let raw_value = value[2];
            if (ff_val !== "-" && raw_value) {
                return <LongFloatPopover content={`${raw_value}`} />;
            }
        };
        return (
            <table id={id} className="table table-sm table-bordered">
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
                            <td>
                                {item[1]}
                                {formatPopover(item)}
                            </td>
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
    colwidths: [30, 70],
};

export default TwoColumnTable;
