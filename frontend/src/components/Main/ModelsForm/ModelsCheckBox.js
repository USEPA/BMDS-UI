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
        const {store, type, model, disabled} = props;

        return store.canEdit ? (
            <td>
                <CheckboxInput
                    id={type + "-" + model}
                    disabled={disabled}
                    onChange={value => store.setModelSelection(type, model, value)}
                    checked={isModelChecked(store.models, type, model)}
                />
            </td>
        ) : (
            <td>{checkOrEmpty(isModelChecked(store.models, type, model))}</td>
        );
    }),
    multistageHelpText = `Multistage degrees will be run up to a maximum
        degree as specified by the user. For Bayesian Model Averaging, only the 2nd degree
        Multistage model is used (see User Manual for details).`,
    polyHelpText = `Polynomial degrees will be run up to a maximum
        degree as specified by the user (see User Manual for details).`,
    multiReducedHelpText = `The reduced form does not include intermediate polynomial terms. For example, the reduced model runs the form y = β₀ + β₁X + β<sub>n</sub>X<sup>n</sup>, where <i>n</i> is the maximum degree, a total of 3 parameters. The full form includes intermediate N parameters, in the form y = β₀ + β₁X + β₂X² + ... + β<sub>n</sub>X<sup>n</sup>.`,
    polyReducedHelpText = `When checked, the polynomial model is run in the form  y = β₀ + β₁X + β<sub>n</sub>X<sup>n</sup>, where <i>n</i> is the maximum degree. When unchecked, the the includes intermediate powers, is run in the form y = β₀ + β₁X + β₂X² + ... + β<sub>n</sub>X<sup>n</sup>`,
    fr = "frequentist_restricted",
    fu = "frequentist_unrestricted",
    b = "bayesian";

const ModelsCheckBox = observer(props => {
    const {store} = props,
        writeMode = store.canEdit;
    if (store.getModelType === mc.MODEL_CONTINUOUS) {
        return (
            <tbody>
                <tr className="preview">
                    <td className="text-left align-middle">Exponential 2</td>
                    <CheckBoxTd store={store} type={fr} model={"Exponential 2"} />
                    <td></td>
                    <CheckBoxTd store={store} type={b} model={"Exponential 2"} disabled={true} />
                    <PriorWeightTd store={store} model={"Exponential 2"} disabled={true} />
                </tr>
                <tr className="preview">
                    <td className="text-left align-middle">Exponential 3</td>
                    <CheckBoxTd store={store} type={fr} model={"Exponential 3"} />
                    <td></td>
                    <CheckBoxTd store={store} type={b} model={"Exponential 3"} disabled={true} />
                    <PriorWeightTd store={store} model={"Exponential 3"} disabled={true} />
                </tr>
                <tr className="preview">
                    <td className="text-left align-middle">Exponential 4</td>
                    <CheckBoxTd store={store} type={fr} model={"Exponential 4"} />
                    <td></td>
                    <CheckBoxTd store={store} type={b} model={"Exponential 4"} disabled={true} />
                    <PriorWeightTd store={store} model={"Exponential 4"} disabled={true} />
                </tr>
                <tr className="preview">
                    <td className="text-left align-middle">Exponential 5</td>
                    <CheckBoxTd store={store} type={fr} model={"Exponential 5"} />
                    <td></td>
                    <CheckBoxTd store={store} type={b} model={"Exponential 5"} disabled={true} />
                    <PriorWeightTd store={store} model={"Exponential 5"} disabled={true} />
                </tr>
                <tr>
                    <td className="text-left align-middle">Hill</td>
                    <CheckBoxTd store={store} type={fr} model={"Hill"} />
                    <CheckBoxTd store={store} type={fu} model={"Hill"} />
                    <CheckBoxTd store={store} type={b} model={"Hill"} disabled={true} />
                    <PriorWeightTd store={store} model={"Hill"} disabled={true} />
                </tr>
                <tr className="preview">
                    <td className="text-left align-middle">Michaelis-Menten</td>
                    <CheckBoxTd store={store} type={fr} model={"Michaelis-Menten"} />
                    <CheckBoxTd store={store} type={fu} model={"Michaelis-Menten"} />
                    <CheckBoxTd store={store} type={b} model={"Michaelis-Menten"} disabled={true} />
                    <PriorWeightTd store={store} model={"Michaelis-Menten"} disabled={true} />
                </tr>
                <tr>
                    <td className="text-left align-middle">Linear</td>
                    <td></td>
                    <CheckBoxTd store={store} type={fu} model={"Linear"} />
                    <CheckBoxTd store={store} type={b} model={"Linear"} disabled={true} />
                    <PriorWeightTd store={store} model={"Linear"} disabled={true} />
                </tr>
                <tr>
                    <td className="text-left align-middle">
                        Polynomial
                        {writeMode ? (
                            <HelpTextPopover title="Polynomial" content={polyHelpText} />
                        ) : null}
                    </td>
                    <CheckBoxTd store={store} type={fr} model={"Polynomial"} />
                    <CheckBoxTd store={store} type={fu} model={"Polynomial"} />
                    <CheckBoxTd store={store} type={b} model={"Polynomial"} disabled={true} />
                    <PriorWeightTd store={store} model={"Polynomial"} disabled={true} />
                </tr>
                {/* <tr className="preview">
                    <td className="text-left align-middle">
                        Polynomial (Reduced)
                        {writeMode ? (
                            <HelpTextPopover
                                title="Polynomial (Reduced)"
                                content={polyReducedHelpText}
                            />
                        ) : null}
                    </td>
                    <CheckBoxTd store={store} type={fr} model={"Polynomial (Reduced)"} />
                    <CheckBoxTd store={store} type={fu} model={"Polynomial (Reduced)"} />
                    <CheckBoxTd
                        store={store}
                        type={b}
                        model={"Polynomial (Reduced)"}
                        disabled={true}
                    />
                    <PriorWeightTd store={store} model={"Polynomial (Reduced)"} disabled={true} />
                </tr> */}
                <tr>
                    <td className="text-left align-middle">Power</td>
                    <CheckBoxTd store={store} type={fr} model={"Power"} />
                    <CheckBoxTd store={store} type={fu} model={"Power"} />
                    <CheckBoxTd store={store} type={b} model={"Power"} disabled={true} />
                    <PriorWeightTd store={store} model={"Power"} disabled={true} />
                </tr>
            </tbody>
        );
    }
    if (store.getModelType === mc.MODEL_DICHOTOMOUS) {
        return (
            <tbody>
                <tr>
                    <td className="text-left align-middle">Dichotomous Hill</td>
                    <CheckBoxTd store={store} type={fr} model={"Dichotomous-Hill"} />
                    <CheckBoxTd store={store} type={fu} model={"Dichotomous-Hill"} />
                    <CheckBoxTd store={store} type={b} model={"Dichotomous-Hill"} />
                    <PriorWeightTd store={store} model={"Dichotomous-Hill"} />
                </tr>
                <tr className="preview">
                    <td className="text-left align-middle">Michaelis-Menten</td>
                    <CheckBoxTd store={store} type={fr} model={"Michaelis-Menten"} />
                    <CheckBoxTd store={store} type={fu} model={"Michaelis-Menten"} />
                    <td></td>
                    <td></td>
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
                <tr className="preview">
                    <td className="text-left align-middle">LogLogistic (Reduced)</td>
                    <CheckBoxTd store={store} type={fr} model={"LogLogistic (Reduced)"} />
                    <CheckBoxTd store={store} type={fu} model={"LogLogistic (Reduced)"} />
                    <td></td>
                    <td></td>
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
                        {writeMode ? (
                            <HelpTextPopover title="Multistage" content={multistageHelpText} />
                        ) : null}
                    </td>
                    <CheckBoxTd store={store} type={fr} model={"Multistage"} />
                    <CheckBoxTd store={store} type={fu} model={"Multistage"} />
                    <CheckBoxTd store={store} type={b} model={"Multistage"} />
                    <PriorWeightTd store={store} model={"Multistage"} />
                </tr>
                {/* <tr className="preview">
                    <td className="text-left align-middle">
                        Multistage (Reduced)
                        {writeMode ? (
                            <HelpTextPopover
                                title="Multistage (Reduced)"
                                content={multiReducedHelpText}
                            />
                        ) : null}
                    </td>
                    <CheckBoxTd store={store} type={fr} model={"Multistage (Reduced)"} />
                    <CheckBoxTd store={store} type={fu} model={"Multistage (Reduced)"} />
                    <td></td>
                    <td></td>
                </tr> */}
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
    }
    if (store.getModelType === mc.MODEL_NESTED_DICHOTOMOUS) {
        return (
            <tbody>
                <tr>
                    <td className="text-left align-middle">Nested Logistic</td>
                    <CheckBoxTd store={store} type={fr} model={"Nested Logistic"} />
                    <CheckBoxTd store={store} type={fu} model={"Nested Logistic"} />
                </tr>
                <tr>
                    <td className="text-left align-middle">NCTR</td>
                    <CheckBoxTd store={store} type={fr} model={"NCTR"} />
                    <CheckBoxTd store={store} type={fu} model={"NCTR"} />
                </tr>
            </tbody>
        );
    }
    if (store.getModelType === mc.MODEL_MULTI_TUMOR) {
        return (
            <tbody>
                <tr>
                    <td className="text-left align-middle">
                        Multistage
                        {writeMode ? <HelpTextPopover content={multistageHelpText} /> : null}
                    </td>
                    <CheckBoxTd store={store} type={fr} model={"Multistage"} />
                    <CheckBoxTd store={store} type={fu} model={"Multistage"} disabled={true} />
                </tr>
            </tbody>
        );
    }
    throw `Unknown modelType: ${store.getModelType}`;
});
ModelsCheckBox.propTypes = {
    store: PropTypes.any,
};
export default ModelsCheckBox;
