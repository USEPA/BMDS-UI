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
        return (
            <table className="table table-sm">
                <colgroup>
                    {_.map(data.colWidths).map((value, idx) => (
                        <col key={idx} width={`${value}%`}></col>
                    ))}
                </colgroup>
                <thead className="table-bordered">
                    {data.subheader ? (
                        <tr className="bg-custom">
                            <th colSpan={nCols}>{data.subheader}</th>
                        </tr>
                    ) : null}
                    <tr className="bg-custom">
                        {data.headers.map((text, idx) => (
                            <th key={idx}>{text}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className="table-bordered">
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
    }),
};

export default Table;
