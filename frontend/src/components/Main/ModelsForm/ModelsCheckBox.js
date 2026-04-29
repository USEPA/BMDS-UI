import { observer } from "mobx-react";
import PropTypes from "prop-types";
import React from "react";

import * as mc from "@/constants/mainConstants";
import { allModelOptions } from "@/constants/modelConstants";

import { checkOrEmpty } from "../../../common";
import CheckboxInput from "../../common/CheckboxInput";
import FloatInput from "../../common/FloatInput";
import HelpTextPopover from "../../common/HelpTextPopover";

const isModelChecked = function (models, type, model) {
    let checked = false;
    if (type in models) {
      if (type === mc.TOXICR_BAYESIAN || type === mc.LOUD_BAYESIAN) {
        checked = models[type].findIndex((obj) => obj.model === model) > -1;
      } else {
        checked = models[type].indexOf(model) > -1;
      }
    }
    return checked;
  },
  getPriorWeightValue = function (models, type, model) {
    let prior_weight = 0;
    if (type in models) {
      let obj = models[type].find((obj) => obj.model === model);
      if (obj != undefined) {
        prior_weight = obj.prior_weight;
      }
    }
    return prior_weight;
  },
  PriorWeightTd = observer((props) => {
    const { store, type, model, disabled, headers } = props;
    return (
      <td headers={headers}>
        {store.canEdit ? (
          <FloatInput
            disabled={disabled}
            value={getPriorWeightValue(store.models, type, model)}
            onChange={(value) => store.setPriorWeight(type, model, value)}
          />
        ) : (
          getPriorWeightValue(store.models, type, model)
        )}
      </td>
    );
  }),
  CheckBoxTd = observer((props) => {
    const { store, type, model, disabled, headers } = props,
      key = `${type}-${model}`;
    return (
      <td key={key} headers={headers}>
        {store.canEdit ? (
          <CheckboxInput
            id={key}
            disabled={disabled}
            onChange={(value) => store.setModelSelection(type, model, value)}
            checked={isModelChecked(store.models, type, model)}
          />
        ) : (
          checkOrEmpty(isModelChecked(store.models, type, model))
        )}
      </td>
    );
  }),
  ModelHeaderTd = ({ name, extra }) => {
    return (
      <td className="text-left align-middle" headers="m-name">
        {name}
        {extra ? extra : null}
      </td>
    );
  },
  multistageHelpText = `All Multistage model polynomial degrees will be run up to a maximum
        degree as specified by the user. For Bayesian Model Averaging, only the 2nd degree
        Multistage model is used (see User Manual for details).`,
  fr = "frequentist_restricted",
  fu = "frequentist_unrestricted",
  tb = "toxicr_bayesian",
  lb = "loud_bayesian";

const ModelsCheckBox = observer((props) => {
  const { store } = props,
    writeMode = store.canEdit;
  if (store.getModelType === mc.MODEL_NESTED_DICHOTOMOUS) {
    return (
      <tbody>
        <tr>
          <ModelHeaderTd name="Nested Logistic" />
          <CheckBoxTd
            store={store}
            type={fr}
            headers="mle-r"
            model={"Nested Logistic"}
          />
          <CheckBoxTd
            store={store}
            type={fu}
            headers="mle-u"
            model={"Nested Logistic"}
          />
        </tr>
        <tr>
          <ModelHeaderTd name="NCTR" />
          <CheckBoxTd store={store} type={fr} headers="mle-r" model={"NCTR"} />
          <CheckBoxTd store={store} type={fu} headers="mle-u" model={"NCTR"} />
        </tr>
      </tbody>
    );
  } else if (store.getModelType === mc.MODEL_CONTINUOUS) {
    if (store.activeTab === "mle") {
      return (
        <tbody>
          <tr>
            <ModelHeaderTd name="Exponential" />
            <CheckBoxTd
              store={store}
              type={fr}
              headers="mle-r"
              model={"Exponential"}
            />
            <td id="mle-u"></td>
          </tr>
          <tr>
            <ModelHeaderTd name="Hill" />
            <CheckBoxTd
              store={store}
              type={fr}
              headers="mle-r"
              model={"Hill"}
            />
            <CheckBoxTd
              store={store}
              type={fu}
              headers="mle-u"
              model={"Hill"}
            />
          </tr>
          <tr>
            <ModelHeaderTd name="Linear" />
            <td id="mle-r"></td>
            <CheckBoxTd
              store={store}
              type={fu}
              headers="mle-u"
              model={"Linear"}
            />
          </tr>
          <tr>
            <ModelHeaderTd name="Polynomial" />
            <CheckBoxTd
              store={store}
              type={fr}
              headers="mle-r"
              model={"Polynomial"}
            />
            <CheckBoxTd
              store={store}
              type={fu}
              headers="mle-u"
              model={"Polynomial"}
            />
          </tr>
          <tr>
            <ModelHeaderTd name="Power" />
            <CheckBoxTd
              store={store}
              type={fr}
              headers="mle-r"
              model={"Power"}
            />
            <CheckBoxTd
              store={store}
              type={fu}
              headers="mle-u"
              model={"Power"}
            />
          </tr>
        </tbody>
      );
    } else if (store.activeTab === "loud_bayesian") {
      return (
        <tbody>
          <tr>
            <ModelHeaderTd name="Exponential" />
            <CheckBoxTd
              store={store}
              type={lb}
              headers="lb-i"
              model={"Exponential"}
            />
            <PriorWeightTd
              store={store}
              type={lb}
              model={"Exponential"}
              headers="lb-p"
            />
          </tr>
          <tr>
            <ModelHeaderTd name="Hill" />
            <CheckBoxTd store={store} type={lb} headers="lb-i" model={"Hill"} />
            <PriorWeightTd
              store={store}
              type={lb}
              model={"Hill"}
              headers="lb-p"
            />
          </tr>
          <tr>
            <ModelHeaderTd name="Linear" />
            <CheckBoxTd
              store={store}
              type={lb}
              headers="lb-i"
              model={"Linear"}
            />
            <PriorWeightTd
              store={store}
              type={lb}
              model={"Linear"}
              headers="lb-p"
            />
          </tr>
          <tr>
            <ModelHeaderTd name="Polynomial" />
            <CheckBoxTd
              store={store}
              type={lb}
              headers="lb-i"
              model={"Polynomial"}
            />
            <PriorWeightTd
              store={store}
              type={lb}
              model={"Polynomial"}
              headers="lb-p"
            />
          </tr>
          <tr>
            <ModelHeaderTd name="Power" />
            <CheckBoxTd
              store={store}
              type={lb}
              headers="lb-i"
              model={"Power"}
            />
            <PriorWeightTd
              store={store}
              type={lb}
              model={"Power"}
              headers="lb-p"
            />
          </tr>
        </tbody>
      );
    }
  } else if (store.getModelType === mc.MODEL_DICHOTOMOUS) {
    if (store.activeTab === "mle") {
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
          </tr>
          <tr>
            <ModelHeaderTd name="Gamma" />
            <CheckBoxTd
              store={store}
              type={fr}
              headers="mle-r"
              model={"Gamma"}
            />
            <CheckBoxTd
              store={store}
              type={fu}
              headers="mle-u"
              model={"Gamma"}
            />
          </tr>
          <tr>
            <ModelHeaderTd name="Logistic" />
            <td id="mle-r"></td>
            <CheckBoxTd
              store={store}
              type={fu}
              headers="mle-u"
              model={"Logistic"}
            />
          </tr>
          <tr>
            <ModelHeaderTd name="Log Logistic" />
            <CheckBoxTd
              store={store}
              type={fr}
              headers="mle-r"
              model={"LogLogistic"}
            />
            <CheckBoxTd
              store={store}
              type={fu}
              headers="mle-u"
              model={"LogLogistic"}
            />
          </tr>
          <tr>
            <ModelHeaderTd name="Log Probit" />
            <CheckBoxTd
              store={store}
              type={fr}
              headers="mle-r"
              model={"LogProbit"}
            />
            <CheckBoxTd
              store={store}
              type={fu}
              headers="mle-u"
              model={"LogProbit"}
            />
          </tr>
          <tr>
            <ModelHeaderTd
              name="Multistage"
              extra={
                writeMode ? (
                  <HelpTextPopover content={multistageHelpText} />
                ) : null
              }
            />
            <CheckBoxTd
              store={store}
              type={fr}
              headers="mle-r"
              model={"Multistage"}
            />
            <CheckBoxTd
              store={store}
              type={fu}
              headers="mle-u"
              model={"Multistage"}
            />
          </tr>
          <tr>
            <ModelHeaderTd name="Probit" />
            <td id="mle-r"></td>
            <CheckBoxTd
              store={store}
              type={fu}
              headers="mle-u"
              model={"Probit"}
            />
          </tr>
          <tr>
            <ModelHeaderTd name="Quantal Linear" />
            <td id="mle-r"></td>
            <CheckBoxTd
              store={store}
              type={fu}
              headers="mle-u"
              model={"Quantal Linear"}
            />
          </tr>
          <tr>
            <ModelHeaderTd name="Weibull" />
            <CheckBoxTd
              store={store}
              type={fr}
              headers="mle-r"
              model={"Weibull"}
            />
            <CheckBoxTd
              store={store}
              type={fu}
              headers="mle-u"
              model={"Weibull"}
            />
          </tr>
        </tbody>
      );
    } else if (store.activeTab === "toxicr_bayesian") {
      return (
        <tbody>
          <tr>
            <ModelHeaderTd name="Dichotomous Hill" />
            <CheckBoxTd
              store={store}
              type={tb}
              headers="tb-i"
              model={"Dichotomous-Hill"}
            />
            <PriorWeightTd
              store={store}
              type={tb}
              model={"Dichotomous-Hill"}
              headers="tb-p"
            />
          </tr>
          <tr>
            <ModelHeaderTd name="Gamma" />
            <CheckBoxTd
              store={store}
              type={tb}
              headers="tb-i"
              model={"Gamma"}
            />
            <PriorWeightTd
              store={store}
              type={tb}
              model={"Gamma"}
              headers="tb-p"
            />
          </tr>
          <tr>
            <ModelHeaderTd name="Logistic" />
            <CheckBoxTd
              store={store}
              type={tb}
              headers="tb-i"
              model={"Logistic"}
            />
            <PriorWeightTd
              store={store}
              type={tb}
              model={"Logistic"}
              headers="tb-p"
            />
          </tr>
          <tr>
            <ModelHeaderTd name="Log Logistic" />
            <CheckBoxTd
              store={store}
              type={tb}
              headers="tb-i"
              model={"LogLogistic"}
            />
            <PriorWeightTd
              store={store}
              type={tb}
              model={"LogLogistic"}
              headers="tb-p"
            />
          </tr>
          <tr>
            <ModelHeaderTd name="Log Probit" />
            <CheckBoxTd
              store={store}
              type={tb}
              headers="tb-i"
              model={"LogProbit"}
            />
            <PriorWeightTd
              store={store}
              type={tb}
              model={"LogProbit"}
              headers="tb-p"
            />
          </tr>
          <tr>
            <ModelHeaderTd
              name="Multistage"
              extra={
                writeMode ? (
                  <HelpTextPopover content={multistageHelpText} />
                ) : null
              }
            />
            <CheckBoxTd
              store={store}
              type={tb}
              headers="tb-i"
              model={"Multistage"}
            />
            <PriorWeightTd
              store={store}
              type={tb}
              model={"Multistage"}
              headers="tb-p"
            />
          </tr>
          <tr>
            <ModelHeaderTd name="Probit" />
            <CheckBoxTd
              store={store}
              type={tb}
              headers="tb-i"
              model={"Probit"}
            />
            <PriorWeightTd
              store={store}
              type={tb}
              model={"Probit"}
              headers="tb-p"
            />
          </tr>
          <tr>
            <ModelHeaderTd name="Quantal Linear" />
            <CheckBoxTd
              store={store}
              type={tb}
              headers="tb-i"
              model={"Quantal Linear"}
            />
            <PriorWeightTd
              store={store}
              type={tb}
              model={"Quantal Linear"}
              headers="tb-p"
            />
          </tr>
          <tr>
            <ModelHeaderTd name="Weibull" />
            <CheckBoxTd
              store={store}
              type={tb}
              headers="tb-i"
              model={"Weibull"}
            />
            <PriorWeightTd
              store={store}
              type={tb}
              model={"Weibull"}
              headers="tb-p"
            />
          </tr>
        </tbody>
      );
    } else if (store.activeTab === "loud_bayesian") {
      return (
        <tbody>
          <tr>
            <ModelHeaderTd name="Dichotomous Hill" />
            <CheckBoxTd
              store={store}
              type={lb}
              headers="lb-i"
              model={"Dichotomous-Hill"}
            />
            <PriorWeightTd
              store={store}
              type={lb}
              model={"Dichotomous-Hill"}
              headers="lb-p"
            />
          </tr>
          <tr>
            <ModelHeaderTd name="Gamma" />
            <CheckBoxTd
              store={store}
              type={lb}
              headers="lb-i"
              model={"Gamma"}
            />
            <PriorWeightTd
              store={store}
              type={lb}
              model={"Gamma"}
              headers="lb-p"
            />
          </tr>
          <tr>
            <ModelHeaderTd name="Logistic" />
            <CheckBoxTd
              store={store}
              type={lb}
              headers="lb-i"
              model={"Logistic"}
            />
            <PriorWeightTd
              store={store}
              type={lb}
              model={"Logistic"}
              headers="lb-p"
            />
          </tr>
          <tr>
            <ModelHeaderTd name="Log Logistic" />
            <CheckBoxTd
              store={store}
              type={lb}
              headers="lb-i"
              model={"LogLogistic"}
            />
            <PriorWeightTd
              store={store}
              type={lb}
              model={"LogLogistic"}
              headers="lb-p"
            />
          </tr>
          <tr>
            <ModelHeaderTd name="Log Probit" />
            <CheckBoxTd
              store={store}
              type={lb}
              headers="lb-i"
              model={"LogProbit"}
            />
            <PriorWeightTd
              store={store}
              type={lb}
              model={"LogProbit"}
              headers="lb-p"
            />
          </tr>
          <tr>
            <ModelHeaderTd
              name="Multistage"
              extra={
                writeMode ? (
                  <HelpTextPopover content={multistageHelpText} />
                ) : null
              }
            />
            <CheckBoxTd
              store={store}
              type={lb}
              headers="lb-i"
              model={"Multistage"}
            />
            <PriorWeightTd
              store={store}
              type={lb}
              model={"Multistage"}
              headers="lb-p"
            />
          </tr>
          <tr>
            <ModelHeaderTd name="Probit" />
            <CheckBoxTd
              store={store}
              type={lb}
              headers="lb-i"
              model={"Probit"}
            />
            <PriorWeightTd
              store={store}
              type={lb}
              model={"Probit"}
              headers="lb-p"
            />
          </tr>
          <tr>
            <ModelHeaderTd name="Quantal Linear" />
            <CheckBoxTd
              store={store}
              type={lb}
              headers="lb-i"
              model={"Quantal Linear"}
            />
            <PriorWeightTd
              store={store}
              type={lb}
              model={"Quantal Linear"}
              headers="lb-p"
            />
          </tr>
          <tr>
            <ModelHeaderTd name="Weibull" />
            <CheckBoxTd
              store={store}
              type={lb}
              headers="lb-i"
              model={"Weibull"}
            />
            <PriorWeightTd
              store={store}
              type={lb}
              model={"Weibull"}
              headers="lb-p"
            />
          </tr>
        </tbody>
      );
    }
  } else {
    throw `Unknown modelType: ${store.getModelType}`;
  }
});
ModelsCheckBox.propTypes = {
  store: PropTypes.any,
};
ModelHeaderTd.propTypes = {
  name: PropTypes.string.isRequired,
  extra: PropTypes.node,
};
export default ModelsCheckBox;
