import {observer} from "mobx-react";
import PropTypes from "prop-types";
import React from "react";

import * as mc from "@/constants/mainConstants";

import {checkOrEmpty} from "../../../common";
import CheckboxInput from "../../common/CheckboxInput";
import FloatInput from "../../common/FloatInput";
import HelpTextPopover from "../../common/HelpTextPopover";

const isModelChecked = (models, type, model) => {
    let checked = false;
    if (type in models) {
        if (type === mc.BAYESIAN) {
            checked = models[type].findIndex(obj => obj.model === model) > -1;
        } else {
            checked = models[type].indexOf(model) > -1;
        }
    }
    return checked;
};
const getPriorWeightValue = (models, model) => {
    let prior_weight = 0;
    if (mc.BAYESIAN in models) {
        const obj = models[mc.BAYESIAN].find(obj => obj.model === model);
        if (obj !== undefined) {
            prior_weight = obj.prior_weight;
        }
    }
    return prior_weight;
};
const PriorWeightTd = observer(props => {
    const {store, model, disabled} = props;
    return (
        <td headers="b-p">
            {store.canEdit ? (
                <FloatInput
                    disabled={disabled}
                    value={getPriorWeightValue(store.models, model)}
                    onChange={value => store.setPriorWeight(model, value)}
                />
            ) : (
                getPriorWeightValue(store.models, model)
            )}
        </td>
    );
});
const CheckBoxTd = observer(props => {
    const {store, type, model, disabled, headers} = props;
    const key = `${type}-${model}`;
    return (
        <td key={key} headers={headers}>
            {store.canEdit ? (
                <CheckboxInput
                    id={key}
                    disabled={disabled}
                    onChange={value => store.setModelSelection(type, model, value)}
                    checked={isModelChecked(store.models, type, model)}
                />
            ) : (
                checkOrEmpty(isModelChecked(store.models, type, model))
            )}
        </td>
    );
});
const ModelHeaderTd = ({name, extra}) => {
    return (
        <td className="text-left align-middle" headers="m-name">
            {name}
            {extra ? extra : null}
        </td>
    );
};
const multistageHelpText = `All Multistage model polynomial degrees will be run up to a maximum
        degree as specified by the user. For Bayesian Model Averaging, only the 2nd degree
        Multistage model is used (see User Manual for details).`;
const fr = "frequentist_restricted";
const fu = "frequentist_unrestricted";
const b = "bayesian";

const ModelsCheckBox = observer(props => {
    const {store} = props;
    const writeMode = store.canEdit;
    if (store.getModelType === mc.MODEL_CONTINUOUS) {
        return (
            <tbody>
                <tr>
                    <ModelHeaderTd name="Exponential" />
                    <CheckBoxTd store={store} type={fr} headers="mle-r" model={"Exponential"} />
                    <td id="mle-u" />
                </tr>
                <tr>
                    <ModelHeaderTd name="Hill" />
                    <CheckBoxTd store={store} type={fr} headers="mle-r" model={"Hill"} />
                    <CheckBoxTd store={store} type={fu} headers="mle-u" model={"Hill"} />
                </tr>
                <tr>
                    <ModelHeaderTd name="Linear" />
                    <td id="mle-r" />
                    <CheckBoxTd store={store} type={fu} headers="mle-u" model={"Linear"} />
                </tr>
                <tr>
                    <ModelHeaderTd name="Polynomial" />
                    <CheckBoxTd store={store} type={fr} headers="mle-r" model={"Polynomial"} />
                    <CheckBoxTd store={store} type={fu} headers="mle-u" model={"Polynomial"} />
                </tr>
                <tr>
                    <ModelHeaderTd name="Power" />
                    <CheckBoxTd store={store} type={fr} headers="mle-r" model={"Power"} />
                    <CheckBoxTd store={store} type={fu} headers="mle-u" model={"Power"} />
                </tr>
            </tbody>
        );
    }
    if (store.getModelType === mc.MODEL_DICHOTOMOUS) {
        return (
            <tbody>
                <tr>
                    <ModelHeaderTd name="Dichotomous Hill" />
                    <CheckBoxTd
                        store={store}
                        type={fr}
                        headers="mle-r"
                        model={"Dichotomous-Hill"}
                    />
                    <CheckBoxTd
                        store={store}
                        type={fu}
                        headers="mle-u"
                        model={"Dichotomous-Hill"}
                    />
                    <CheckBoxTd store={store} type={b} headers="b-i" model={"Dichotomous-Hill"} />
                    <PriorWeightTd store={store} model={"Dichotomous-Hill"} />
                </tr>
                <tr>
                    <ModelHeaderTd name="Gamma" />
                    <CheckBoxTd store={store} type={fr} headers="mle-r" model={"Gamma"} />
                    <CheckBoxTd store={store} type={fu} headers="mle-u" model={"Gamma"} />
                    <CheckBoxTd store={store} type={b} headers="b-i" model={"Gamma"} />
                    <PriorWeightTd store={store} model={"Gamma"} />
                </tr>
                <tr>
                    <ModelHeaderTd name="Logistic" />
                    <td headers="mle-r" />
                    <CheckBoxTd store={store} type={fu} headers="mle-u" model={"Logistic"} />
                    <CheckBoxTd store={store} type={b} headers="b-i" model={"Logistic"} />
                    <PriorWeightTd store={store} model={"Logistic"} />
                </tr>
                <tr>
                    <ModelHeaderTd name="Log Logistic" />
                    <CheckBoxTd store={store} type={fr} headers="mle-r" model={"LogLogistic"} />
                    <CheckBoxTd store={store} type={fu} headers="mle-u" model={"LogLogistic"} />
                    <CheckBoxTd store={store} type={b} headers="b-i" model={"LogLogistic"} />
                    <PriorWeightTd store={store} model={"LogLogistic"} />
                </tr>
                <tr>
                    <ModelHeaderTd name="Log Probit" />
                    <CheckBoxTd store={store} type={fr} headers="mle-r" model={"LogProbit"} />
                    <CheckBoxTd store={store} type={fu} headers="mle-u" model={"LogProbit"} />
                    <CheckBoxTd store={store} type={b} headers="b-i" model={"LogProbit"} />
                    <PriorWeightTd store={store} model={"LogProbit"} />
                </tr>
                <tr>
                    <ModelHeaderTd
                        name="Multistage"
                        extra={writeMode ? <HelpTextPopover content={multistageHelpText} /> : null}
                    />
                    <CheckBoxTd store={store} type={fr} headers="mle-r" model={"Multistage"} />
                    <CheckBoxTd store={store} type={fu} headers="mle-u" model={"Multistage"} />
                    <CheckBoxTd store={store} type={b} headers="b-i" model={"Multistage"} />
                    <PriorWeightTd store={store} model={"Multistage"} />
                </tr>
                <tr>
                    <ModelHeaderTd name="Probit" />
                    <td headers="mle-r" />
                    <CheckBoxTd store={store} type={fu} headers="mle-u" model={"Probit"} />
                    <CheckBoxTd store={store} type={b} headers="b-i" model={"Probit"} />
                    <PriorWeightTd store={store} model={"Probit"} />
                </tr>
                <tr>
                    <ModelHeaderTd name="Quantal Linear" />
                    <td headers="mle-r" />
                    <CheckBoxTd store={store} type={fu} headers="mle-u" model={"Quantal Linear"} />
                    <CheckBoxTd store={store} type={b} headers="b-i" model={"Quantal Linear"} />
                    <PriorWeightTd store={store} model={"Quantal Linear"} />
                </tr>
                <tr>
                    <ModelHeaderTd name="Weibull" />
                    <CheckBoxTd store={store} type={fr} headers="mle-r" model={"Weibull"} />
                    <CheckBoxTd store={store} type={fu} headers="mle-u" model={"Weibull"} />
                    <CheckBoxTd store={store} type={b} headers="b-i" model={"Weibull"} />
                    <PriorWeightTd store={store} model={"Weibull"} />
                </tr>
            </tbody>
        );
    }
    if (store.getModelType === mc.MODEL_NESTED_DICHOTOMOUS) {
        return (
            <tbody>
                <tr>
                    <ModelHeaderTd name="Nested Logistic" />
                    <CheckBoxTd store={store} type={fr} headers="mle-r" model={"Nested Logistic"} />
                    <CheckBoxTd store={store} type={fu} headers="mle-u" model={"Nested Logistic"} />
                </tr>
                <tr>
                    <ModelHeaderTd name="NCTR" />
                    <CheckBoxTd store={store} type={fr} headers="mle-r" model={"NCTR"} />
                    <CheckBoxTd store={store} type={fu} headers="mle-u" model={"NCTR"} />
                </tr>
            </tbody>
        );
    }
    throw `Unknown modelType: ${store.getModelType}`;
});
ModelsCheckBox.propTypes = {
    store: PropTypes.any,
};
ModelHeaderTd.propTypes = {
    name: PropTypes.string.isRequired,
    extra: PropTypes.node,
};
export default ModelsCheckBox;
