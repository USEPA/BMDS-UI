import _ from "lodash";
import {observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";

@observer
class Table extends Component {
    render() {
        const {data} = this.props,
            nCols = data.headers.length;
        if (_.isUndefined(data.colWidths)) {
            data.colWidths = _.fill(Array(nCols), Math.round(100 / nCols));
        }
        if (_.isUndefined(data.tblClasses)) {
            data.tblClasses = "table table-sm";
        }
        return (
            <table className={data.tblClasses}>
                <colgroup>
                    {_.map(data.colWidths).map((value, idx) => (
                        <col key={idx} width={`${value}%`}></col>
                    ))}
                </colgroup>
                <thead>
                    {data.subheader ? (
                        <tr className="bg-custom sticky-top">
                            <th colSpan={nCols}>{data.subheader}</th>
                        </tr>
                    ) : null}
                    <tr className="bg-custom sticky-top">
                        {data.headers.map((text, idx) => (
                            <th key={idx}>{text}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.rows.map((rows, idx) => (
                        <tr key={idx}>
                            {rows.map((text, idx) => (
                                <td key={idx}>{text}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
                {data.footnotes ? (
                    <tfoot>
                        <tr>
                            <td colSpan={nCols}>{data.footnotes}</td>
                        </tr>
                    </tfoot>
                ) : null}
            </table>
        );
    }
}
Table.propTypes = {
    data: PropTypes.shape({
        headers: PropTypes.array.isRequired,
        rows: PropTypes.arrayOf(PropTypes.array).isRequired,
        subheader: PropTypes.string,
        colWidths: PropTypes.arrayOf(PropTypes.number),
        footnotes: PropTypes.node,
        tblClasses: PropTypes.string,
    }),
};

export default Table;
