import {observer} from "mobx-react";
import PropTypes from "prop-types";
import React from "react";

import * as mc from "@/constants/mainConstants";
import {allModelOptions} from "@/constants/modelConstants";

import Button from "../../common/Button";
import CheckboxInput from "../../common/CheckboxInput";
import LabelInput from "../../common/LabelInput";

const areAllModelsChecked = function(modelType, type, models) {
        return type in models && models[type].length === allModelOptions[modelType][type].length;
    },
    SelectAllComponent = observer(props => {
        const {store, type, disabled, label} = props,
            id = `select_all_${type}`;
        return (
            <>
                <CheckboxInput
                    id={id}
                    disabled={disabled}
                    onChange={value => store.enableAll(type, value)}
                    checked={areAllModelsChecked(store.getModelType, type, store.models)}
                />
                &nbsp;
                <LabelInput label={label} htmlFor={id} />
            </>
        );
    }),
    ModelColGroup = observer(props => {
        const {hasBayesianModels} = props,
            cols = hasBayesianModels ? [20, 20, 20, 20, 20] : [33, 33, 34];
        return (
            <colgroup>
                {cols.map((d, i) => (
                    <col key={i} width={`${d}%`} />
                ))}
            </colgroup>
        );
    });

const ModelsCheckBoxHeader = observer(props => {
    const {store} = props,
        {canEdit} = store,
        hasBayesianModels = store.getModelType === mc.MODEL_DICHOTOMOUS;
    return (
        <>
            <ModelColGroup hasBayesianModels={hasBayesianModels} />
            <thead className="bg-custom">
                <tr>
                    <th className="align-top" rowSpan="2">
                        Model
                        {canEdit ? (
                            <>
                                <Button
                                    className="mt-4 btn btn-sm btn-block btn-info"
                                    onClick={store.resetModelSelection}
                                    text="Reset Selection"
                                />
                            </>
                        ) : null}
                    </th>
                    <th colSpan="2">Maximum Likelihood Estimate</th>
                    {hasBayesianModels ? <th colSpan="2">Bayesian Model Averaging</th> : null}
                </tr>
                <tr>
                    <th>
                        Restricted
                        {canEdit ? (
                            <>
                                <br />
                                <SelectAllComponent
                                    store={store}
                                    type={"frequentist_restricted"}
                                    label="Select All"
                                />
                            </>
                        ) : null}
                    </th>
                    <th>
                        Unrestricted
                        {canEdit ? (
                            <>
                                <br />
                                <SelectAllComponent
                                    store={store}
                                    type={"frequentist_unrestricted"}
                                    label="Select All"
                                />
                            </>
                        ) : null}
                    </th>
                    {hasBayesianModels ? (
                        <>
                            <th>
                                Include
                                {canEdit ? (
                                    <>
                                        <br />
                                        <SelectAllComponent
                                            store={store}
                                            type={"bayesian"}
                                            label="Select All"
                                        />
                                    </>
                                ) : null}
                            </th>
                            <th>
                                <span className="mb-1">Prior Weight</span>
                            </th>
                        </>
                    ) : null}
                </tr>
            </thead>
        </>
    );
});
ModelsCheckBoxHeader.propTypes = {
    store: PropTypes.object,
};

export default ModelsCheckBoxHeader;
