import {inject, observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";

import {MODEL_MULTI_TUMOR} from "@/constants/mainConstants";

import Button from "../../common/Button";
import ModelsCheckBox from "./ModelsCheckBox";
import ModelsCheckBoxHeader from "./ModelsCheckBoxHeader";

@inject("modelsStore")
@observer
class ModelsCheckBoxList extends Component {
    render() {
        const {modelsStore} = this.props,
            mainStore = modelsStore.rootStore.mainStore;
        if (modelsStore.getModelType === MODEL_MULTI_TUMOR) {
            return (
                <div className="alert alert-info my-3">
                    If multiple tumor datasets are evaluated, this tool will output individual and
                    combined tumor risk estimates.
                    <br />
                    <br />
                    The combined tumor risk estimates will only be relevant for tumors from the same
                    study and the model assumes that tumors develop independently, eg., one tumor
                    does not progress to or influence the development of another
                </div>
            );
        }
        return (
            <div className="mt-2">
                {mainStore.canEdit ? (
                    <Button
                        className="btn btn-sm btn-warning"
                        onClick={mainStore.resetModelSelection}
                        text="Reset Model Selection"
                    />
                ) : null}
                <table className="table table-sm">
                    <ModelsCheckBoxHeader store={modelsStore} />
                    <ModelsCheckBox store={modelsStore} />
                </table>
            </div>
        );
    }
}
ModelsCheckBoxList.propTypes = {
    modelsStore: PropTypes.object,
    toggleModelsCheckBox: PropTypes.func,
    models: PropTypes.array,
    model_headers: PropTypes.object,
    canEdit: PropTypes.bool,
    onChange: PropTypes.func,
};
export default ModelsCheckBoxList;
