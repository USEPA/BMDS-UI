import {inject, observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";

import AnalysisForm from "./AnalysisForm/AnalysisForm";
import AnalysisFormReadOnly from "./AnalysisForm/AnalysisFormReadOnly";
import DatasetModelOptionList from "./DatasetModelOptionList/DatasetModelOptionList";
import ModelsCheckBoxList from "./ModelsForm/ModelsCheckBoxList";
import OptionsFormList from "./OptionsForm/OptionsFormList";

@inject("mainStore")
@observer
class Main extends Component {
    render() {
        const {mainStore} = this.props;

        return mainStore.isUpdateComplete ? (
            <div className="row">
                <div className="col-lg-4 analysis">
                    <div className="mb-2">
                        {mainStore.canEdit ? <AnalysisForm /> : <AnalysisFormReadOnly />}
                    </div>
                    <div>{mainStore.getDatasetLength ? <DatasetModelOptionList /> : null}</div>
                </div>
                <div className="col-lg-8">
                    <ModelsCheckBoxList />
                    <OptionsFormList />
                </div>
            </div>
        ) : null;
    }
}
Main.propTypes = {
    mainStore: PropTypes.object,
    isUpdateComplete: PropTypes.bool,
};
export default Main;
