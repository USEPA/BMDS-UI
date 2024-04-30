import {inject, observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";

@inject("mainStore")
@observer
class AnalysisFormReadOnly extends Component {
    render() {
        const {mainStore} = this.props;
        return (
            <div className="mt-2">
                <table className="table table-sm">
                    <tbody>
                        <tr>
                            <th>Analysis Name:</th>
                            <td>{mainStore.analysis_name}</td>
                        </tr>
                        <tr>
                            <th>Analysis Description:</th>
                            <td>{mainStore.analysis_description}</td>
                        </tr>
                        <tr>
                            <th>Model Type:</th>
                            <td>{mainStore.getModelTypeName}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }
}
AnalysisFormReadOnly.propTypes = {
    mainStore: PropTypes.object,
};
export default AnalysisFormReadOnly;
