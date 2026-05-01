import { observer } from "mobx-react";
import PropTypes from "prop-types";
import React from "react";

import * as mc from "@/constants/mainConstants";
import { allModelOptions, rowOrder } from "@/constants/modelConstants";

import { checkOrEmpty } from "../../../common";
import CheckboxInput from "../../common/CheckboxInput";
import FloatInput from "../../common/FloatInput";
import HelpTextPopover from "../../common/HelpTextPopover";

const multistageHelpText = `All Multistage model polynomial degrees will be run up to a maximum
        degree as specified by the user. For ToxicR Bayesian Model Averaging, only the 2nd degree
        Multistage model is used (see User Manual for details).`,
  modelsWithHelpText = new Set(["Multistage"]),
  modelDisplayNames = {
    "Dichotomous-Hill": "Dichotomous Hill",
    LogLogistic: "Log Logistic",
    LogProbit: "Log Probit",
    "Quantal Linear": "Quantal Linear",
  };

const getDisplayName = (model) => modelDisplayNames[model] ?? model;

const isModelChecked = (models, type, model) => {
  if (!(type in models)) {
    return false;
  }
  if (type in models) {
    if (type === mc.TOXICR_BAYESIAN || type === mc.LOUD_BAYESIAN) {
      return models[type].findIndex((obj) => obj.model === model) > -1;
    } else {
      return models[type].indexOf(model) > -1;
    }
  }
  return checked;
};

const getPriorWeightValue = (models, type, model) => {
  if (!(type in models)) {
    return 0;
  }
  const obj = models[type].find((obj) => obj.model === model);
  if (obj != undefined) {
    return obj?.prior_weight ?? 0;
  }
};

const PriorWeightTd = observer(({ store, type, model, headers }) => {
  const checked = isModelChecked(store.models, type, model);
  return (
    <td headers={headers}>
      {store.canEdit ? (
        <FloatInput
          disabled={!checked}
          value={checked ? getPriorWeightValue(store.models, type, model) : 0}
          onChange={(value) => store.setPriorWeight(type, model, value)}
        />
      ) : checked ? (
        getPriorWeightValue(store.models, type, model)
      ) : (
        0
      )}
    </td>
  );
});

const CheckBoxTd = observer(({ store, type, model, disabled, headers }) => {
  const key = `${type}-${model}`;

  return (
    <td headers={headers}>
      {store.canEdit ? (
        <CheckboxInput
          id={key}
          onChange={(value) => {
            store.setModelSelection(type, model, value);
            store.setTabBadge(type);
          }}
          checked={isModelChecked(store.models, type, model)}
        />
      ) : (
        checkOrEmpty(isModelChecked(store.models, type, model))
      )}
    </td>
  );
});

const ModelHeaderTd = ({ model, writeMode }) => {
  return (
    <td className="text-left align-middle" headers="m-name">
      {getDisplayName(model)}
      {writeMode && modelsWithHelpText.has(model) ? (
        <HelpTextPopover content={multistageHelpText} />
      ) : null}
    </td>
  );
};

const tabColumns = {
  mle: [
    {
      type: mc.FREQUENTIST_RESTRICTED,
      headers: "mle-r",
      component: "checkbox",
    },
    {
      type: mc.FREQUENTIST_UNRESTRICTED,
      headers: "mle-u",
      component: "checkbox",
    },
  ],
  toxicr_bayesian: [
    {
      type: mc.TOXICR_BAYESIAN,
      headers: "tb-i",
      component: "checkbox",
    },
    {
      type: mc.TOXICR_BAYESIAN,
      headers: "tb-p",
      component: "priorweight",
    },
  ],
  loud_bayesian: [
    {
      type: mc.LOUD_BAYESIAN,
      headers: "lb-i",
      component: "checkbox",
    },
    {
      type: mc.LOUD_BAYESIAN,
      headers: "lb-p",
      component: "priorweight",
    },
  ],
};

const ModelRow = observer(({ store, model, columns }) => (
  <tr>
    <ModelHeaderTd model={model} writeMode={store.canEdit} />
    {columns.map((col) => {
      const modelOptions = allModelOptions[store.getModelType][col.type] ?? [];
      if (!modelOptions.includes(model)) {
        return <td key={col.headers} />;
      }
      if (col.component === "checkbox") {
        return (
          <CheckBoxTd
            key={col.headers}
            store={store}
            type={col.type}
            model={model}
            headers={col.headers}
          />
        );
      }
      if (col.component === "priorweight") {
        return (
          <PriorWeightTd
            key={col.headers}
            store={store}
            type={col.type}
            model={model}
            headers={col.headers}
          />
        );
      }
    })}
  </tr>
));

const ModelsCheckBox = observer(({ store }) => {
  const { getModelType, activeTab } = store;

  if (store.getModelType === mc.MODEL_NESTED_DICHOTOMOUS) {
    const columns = tabColumns.mle;
    const allModels = allModelOptions[getModelType][mc.FREQUENTIST_RESTRICTED];
    return (
      <tbody>
        {allModels.map((model) => (
          <ModelRow key={model} store={store} model={model} columns={columns} />
        ))}
      </tbody>
    );
  }

  const columns = tabColumns[activeTab];
  if (!columns) throw `Unknown activeTab: ${activeTab}`;

  const allModels = rowOrder[getModelType];

  return (
    <tbody>
      {allModels.map((model) => (
        <ModelRow key={model} store={store} model={model} columns={columns} />
      ))}
    </tbody>
  );
});

ModelsCheckBox.propTypes = {
  store: PropTypes.any,
};

ModelHeaderTd.propTypes = {
  model: PropTypes.string.isRequired,
  writeMode: PropTypes.bool,
};

export default ModelsCheckBox;
