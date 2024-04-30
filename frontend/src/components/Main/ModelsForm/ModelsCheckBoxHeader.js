import {observer} from "mobx-react";
import PropTypes from "prop-types";
import React from "react";

import * as mc from "@/constants/mainConstants";
import {allModelOptions} from "@/constants/modelConstants";

import CheckboxInput from "../../common/CheckboxInput";
import HelpTextPopover from "../../common/HelpTextPopover";

const areAllModelsChecked = function(modelType, type, models) {
        return type in models && models[type].length === allModelOptions[modelType][type].length;
    },
    SelectAllComponent = observer(props => {
        const {store, type, disabled} = props;
        return store.canEdit ? (
            <th>
                <label className="m-0">
                    <CheckboxInput
                        id={`select_all_${type}`}
                        disabled={disabled}
                        onChange={value => store.enableAll(type, value)}
                        checked={areAllModelsChecked(store.getModelType, type, store.models)}
                    />
                    &nbsp;Select all
                </label>
            </th>
        ) : (
            <th></th>
        );
    });

const ModelsCheckBoxHeader = observer(props => {
    const {store} = props,
        content = "Models were previewed in BMDS Excel 3.2 and will be formally peer reviewed.",
        title = "Bayesian Model Averaging",
        {hasBayesianModels} = store,
        isContinuous = store.getModelType === mc.MODEL_CONTINUOUS,
        isMultiTumor = store.getModelType === mc.MODEL_MULTI_TUMOR;
    return (
        <thead className="bg-custom">
            <tr>
                <th rowSpan="3">Models</th>
                <th colSpan="2">Maximum Likelihood Estimate</th>
                {hasBayesianModels ? (
                    <th colSpan="3" rowSpan="2">
                        Bayesian Model Averaging
                        {isContinuous ? (
                            <HelpTextPopover title={title} content={content}></HelpTextPopover>
                        ) : null}
                    </th>
                ) : null}
            </tr>
            <tr>
                <th>Restricted</th>
                <th>Unrestricted</th>
            </tr>
            <tr>
                <SelectAllComponent store={store} type={"frequentist_restricted"} />
                <SelectAllComponent
                    store={store}
                    type={"frequentist_unrestricted"}
                    disabled={isMultiTumor}
                />
                {hasBayesianModels ? (
                    <>
                        <SelectAllComponent
                            store={store}
                            type={"bayesian"}
                            disabled={isContinuous}
                        />
                        <th>Prior Weights</th>
                    </>
                ) : null}
            </tr>
        </thead>
    );
});
ModelsCheckBoxHeader.propTypes = {
    store: PropTypes.object,
};
export default ModelsCheckBoxHeader;
