import {observer} from "mobx-react";
import PropTypes from "prop-types";
import React from "react";

import * as mc from "@/constants/mainConstants";

import {checkOrEmpty} from "../../../common";
import CheckboxInput from "../../common/CheckboxInput";
import FloatInput from "../../common/FloatInput";
import HelpTextPopover from "../../common/HelpTextPopover";

const isModelChecked = function(models, type, model) {
        let checked = false;
        if (type in models) {
            if (type === mc.BAYESIAN) {
                checked = models[type].findIndex(obj => obj.model === model) > -1;
            } else {
                checked = models[type].indexOf(model) > -1;
            }
        }
        return checked;
    },
    getPriorWeightValue = function(models, model) {
        let prior_weight = 0;
        if (mc.BAYESIAN in models) {
            let obj = models[mc.BAYESIAN].find(obj => obj.model === model);
            if (obj != undefined) {
                prior_weight = obj.prior_weight;
            }
        }
        return prior_weight;
    },
    PriorWeightTd = observer(props => {
        const {store, model, disabled} = props;
        return store.canEdit ? (
            <td>
                <FloatInput
                    disabled={disabled}
                    value={getPriorWeightValue(store.models, model)}
                    onChange={value => store.setPriorWeight(model, value)}
                />
            </td>
        ) : (
            <td>{getPriorWeightValue(store.models, model)}</td>
        );
    }),
    CheckBoxTd = observer(props => {
        const {store, type, model, disabled} = props,
            id = `${type}-${model}`;
        return store.canEdit ? (
            <td key={id}>
                <CheckboxInput
                    id={id}
                    disabled={disabled}
                    onChange={value => store.setModelSelection(type, model, value)}
                    checked={isModelChecked(store.models, type, model)}
                />
            </td>
        ) : (
            <td key={id}>{checkOrEmpty(isModelChecked(store.models, type, model))}</td>
        );
    }),
    multistageHelpText = `All Multistage model polynomial degrees will be run up to a maximum
        degree as specified by the user. For Bayesian Model Averaging, only the 2nd degree
        Multistage model is used (see User Manual for details).`,
    fr = "frequentist_restricted",
    fu = "frequentist_unrestricted",
    b = "bayesian";

const ModelsCheckBox = observer(props => {
    const {store} = props,
        writeMode = store.canEdit;
    if (store.getModelType === mc.MODEL_CONTINUOUS) {
        return (
            <tbody>
                <tr>
                    <td className="text-left align-middle">Exponential</td>
                    <CheckBoxTd store={store} type={fr} model={"Exponential"} />
                    <td></td>
                </tr>
                <tr>
                    <td className="text-left align-middle">Hill</td>
                    <CheckBoxTd store={store} type={fr} model={"Hill"} />
                    <CheckBoxTd store={store} type={fu} model={"Hill"} />
                </tr>
                <tr>
                    <td className="text-left align-middle">Linear</td>
                    <td></td>
                    <CheckBoxTd store={store} type={fu} model={"Linear"} />
                </tr>
                <tr>
                    <td className="text-left align-middle">Polynomial</td>
                    <CheckBoxTd store={store} type={fr} model={"Polynomial"} />
                    <CheckBoxTd store={store} type={fu} model={"Polynomial"} />
                </tr>
                <tr>
                    <td className="text-left align-middle">Power</td>
                    <CheckBoxTd store={store} type={fr} model={"Power"} />
                    <CheckBoxTd store={store} type={fu} model={"Power"} />
                </tr>
            </tbody>
        );
    } else if (store.getModelType === mc.MODEL_DICHOTOMOUS) {
        return (
            <tbody>
                <tr>
                    <td className="text-left align-middle">Dichotomous Hill</td>
                    <CheckBoxTd store={store} type={fr} model={"Dichotomous-Hill"} />
                    <CheckBoxTd store={store} type={fu} model={"Dichotomous-Hill"} />
                    <CheckBoxTd store={store} type={b} model={"Dichotomous-Hill"} />
                    <PriorWeightTd store={store} model={"Dichotomous-Hill"} />
                </tr>
                <tr>
                    <td className="text-left align-middle">Gamma</td>
                    <CheckBoxTd store={store} type={fr} model={"Gamma"} />
                    <CheckBoxTd store={store} type={fu} model={"Gamma"} />
                    <CheckBoxTd store={store} type={b} model={"Gamma"} />
                    <PriorWeightTd store={store} model={"Gamma"} />
                </tr>
                <tr>
                    <td className="text-left align-middle">Logistic</td>
                    <td></td>
                    <CheckBoxTd store={store} type={fu} model={"Logistic"} />
                    <CheckBoxTd store={store} type={b} model={"Logistic"} />
                    <PriorWeightTd store={store} model={"Logistic"} />
                </tr>
                <tr>
                    <td className="text-left align-middle">Log Logistic</td>
                    <CheckBoxTd store={store} type={fr} model={"LogLogistic"} />
                    <CheckBoxTd store={store} type={fu} model={"LogLogistic"} />
                    <CheckBoxTd store={store} type={b} model={"LogLogistic"} />
                    <PriorWeightTd store={store} model={"LogLogistic"} />
                </tr>
                <tr>
                    <td className="text-left align-middle">LogProbit</td>
                    <CheckBoxTd store={store} type={fr} model={"LogProbit"} />
                    <CheckBoxTd store={store} type={fu} model={"LogProbit"} />
                    <CheckBoxTd store={store} type={b} model={"LogProbit"} />
                    <PriorWeightTd store={store} model={"LogProbit"} />
                </tr>
                <tr>
                    <td className="text-left align-middle">
                        Multistage
                        {writeMode ? <HelpTextPopover content={multistageHelpText} /> : null}
                    </td>
                    <CheckBoxTd store={store} type={fr} model={"Multistage"} />
                    <CheckBoxTd store={store} type={fu} model={"Multistage"} />
                    <CheckBoxTd store={store} type={b} model={"Multistage"} />
                    <PriorWeightTd store={store} model={"Multistage"} />
                </tr>
                <tr>
                    <td className="text-left align-middle">Probit</td>
                    <td></td>
                    <CheckBoxTd store={store} type={fu} model={"Probit"} />
                    <CheckBoxTd store={store} type={b} model={"Probit"} />
                    <PriorWeightTd store={store} model={"Probit"} />
                </tr>
                <tr>
                    <td className="text-left align-middle">Quantal Linear</td>
                    <td></td>
                    <CheckBoxTd store={store} type={fu} model={"Quantal Linear"} />
                    <CheckBoxTd store={store} type={b} model={"Quantal Linear"} />
                    <PriorWeightTd store={store} model={"Quantal Linear"} />
                </tr>
                <tr>
                    <td className="text-left align-middle">Weibull</td>
                    <CheckBoxTd store={store} type={fr} model={"Weibull"} />
                    <CheckBoxTd store={store} type={fu} model={"Weibull"} />
                    <CheckBoxTd store={store} type={b} model={"Weibull"} />
                    <PriorWeightTd store={store} model={"Weibull"} />
                </tr>
            </tbody>
        );
    } else if (store.getModelType === mc.MODEL_NESTED_DICHOTOMOUS) {
        return (
            <tbody>
                <tr>
                    <td className="text-left align-middle">Nested Logistic</td>
                    <CheckBoxTd store={store} type={fr} model={"Nested Logistic"} />
                    <CheckBoxTd store={store} type={fu} model={"Nested Logistic"} />
                </tr>
                <tr>
                    <td className="text-left align-middle">NCTR</td>
                    <CheckBoxTd store={store} type={fr} model={"NCTR"} disabled={true} />
                    <CheckBoxTd store={store} type={fu} model={"NCTR"} disabled={true} />
                </tr>
            </tbody>
        );
    } else {
        throw `Unknown modelType: ${store.getModelType}`;
    }
});
ModelsCheckBox.propTypes = {
    store: PropTypes.any,
};
export default ModelsCheckBox;
