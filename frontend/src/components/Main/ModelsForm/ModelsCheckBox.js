import { observer } from "mobx-react";
import PropTypes from "prop-types";
import React, { useEffect, useRef } from "react";

import * as mc from "@/constants/mainConstants";
import {
  allModelOptions,
  rowOrder,
  computeGroupIndex,
} from "@/constants/modelConstants";

import { checkOrEmpty } from "../../../common";
import CheckboxInput from "../../common/CheckboxInput";
import FloatInput from "../../common/FloatInput";
import HelpTextPopover from "../../common/HelpTextPopover";

const multistageHelpText = `All Multistage model polynomial degrees will be run up to a maximum
        degree as specified by the user.`,
  modelDisplayNames = {
    "Dichotomous-Hill": "Dichotomous Hill",
    LogLogistic: "Log Logistic",
    LogProbit: "Log Probit",
    "Quantal Linear": "Quantal Linear",
  },
  bayesianDichotomousDisplayNames = {
    ...modelDisplayNames,
    Multistage: "Multistage 2",
  };

const getDisplayName = (model) => modelDisplayNames[model] ?? model;

const isModelChecked = (models, type, model) => {
  if (!(type in models)) {
    return false;
  }
  if (type === mc.TOXICR_BAYESIAN || type === mc.LOUD_BAYESIAN) {
    return models[type].findIndex((obj) => obj._displayName === model) > -1;
  } else {
    return models[type].indexOf(model) > -1;
  }
};

const getPriorWeightValue = (models, type, model) => {
  if (!(type in models)) {
    return 0;
  }
  const obj = models[type].find((obj) => obj._displayName === model);
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

const CheckBoxTd = observer(({ store, type, model, headers }) => {
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

const LOUDAccordion = observer(
  ({ store, allModels, columns, accordionState }) => {
    const bmdsGroupIndex = computeGroupIndex(allModels.bmds);
    const extendedGroupIndex = computeGroupIndex(allModels.extended);
    const lastHandledTrigger = useRef(store.expandAllTrigger);

    useEffect(() => {
      if (store.expandAllTrigger > lastHandledTrigger.current) {
        store.setAccordionState("bmds", true);
        store.setAccordionState("extended", true);
        lastHandledTrigger.current = store.expandAllTrigger;
      }
    }, [store.expandAllTrigger]);

    useEffect(() => {
      const bmdsEl = document.getElementById("collapseOne");
      const extendedEl = document.getElementById("collapseTwo");

      const onBmdsHide = () => store.setAccordionState("bmds", false);
      const onBmdsShow = () => store.setAccordionState("bmds", true);
      const onExtendedHide = () => store.setAccordionState("extended", false);
      const onExtendedShow = () => store.setAccordionState("extended", true);

      $(bmdsEl).on("hide.bs.collapse", onBmdsHide);
      $(bmdsEl).on("show.bs.collapse", onBmdsShow);
      $(extendedEl).on("hide.bs.collapse", onExtendedHide);
      $(extendedEl).on("show.bs.collapse", onExtendedShow);

      return () => {
        $(bmdsEl).off("hide.bs.collapse", onBmdsHide);
        $(bmdsEl).off("show.bs.collapse", onBmdsShow);
        $(extendedEl).off("hide.bs.collapse", onExtendedHide);
        $(extendedEl).off("show.bs.collapse", onExtendedShow);
      };
    }, []);

    const bmdsExpanded = accordionState?.bmds ?? true;
    const extendedExpanded = accordionState?.extended ?? true;

    return (
      <td colSpan="3">
        <div id="accordionExample">
          <div className="card">
            <div
              className="card-header"
              id="headingOne"
              style={{ padding: "0 5px" }}
              role="button"
              data-toggle="collapse"
              data-target="#collapseOne"
              aria-expanded={bmdsExpanded}
              aria-controls="collapseOne"
            >
              <span style={{ fontSize: "20px" }}>
                <strong>BMDS Models</strong>
              </span>
            </div>
            <div
              id="collapseOne"
              className={`collapse${bmdsExpanded ? " show" : ""}`}
              aria-labelledby="headingOne"
            >
              <div className="card-body" style={{ padding: "0 5px" }}>
                <table width="100%" style={{ tableLayout: "fixed" }}>
                  <colgroup>
                    <col style={{ width: store.col_widths[0] }} />
                    <col style={{ width: store.col_widths[1] }} />
                    <col style={{ width: store.col_widths[2] }} />
                  </colgroup>
                  <tbody>
                    {allModels.bmds.map((model) => (
                      <ModelRow
                        key={model}
                        store={store}
                        model={model}
                        columns={columns}
                        groupIndex={bmdsGroupIndex[model]}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="card">
            <div
              className="card-header"
              id="headingTwo"
              style={{ padding: "0 5px" }}
              role="button"
              data-toggle="collapse"
              data-target="#collapseTwo"
              aria-expanded={extendedExpanded}
              aria-controls="collapseTwo"
            >
              <span style={{ fontSize: "20px" }}>
                <strong>Extended Models</strong>
              </span>
            </div>
            <div
              id="collapseTwo"
              className={`collapse${extendedExpanded ? " show" : ""}`}
              aria-labelledby="headingTwo"
              style={{ padding: "0 5px" }}
            >
              <div className="card-body" style={{ padding: "0 5px" }}>
                <table width="100%" style={{ tableLayout: "fixed" }}>
                  <colgroup>
                    <col style={{ width: store.col_widths[0] }} />
                    <col style={{ width: store.col_widths[1] }} />
                    <col style={{ width: store.col_widths[2] }} />
                  </colgroup>
                  <tbody>
                    {allModels.extended.map((model) => (
                      <ModelRow
                        key={model}
                        store={store}
                        model={model}
                        columns={columns}
                        groupIndex={extendedGroupIndex[model]}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </td>
    );
  },
);

const ModelHeaderTd = ({ model, writeMode, getLabel = getDisplayName }) => {
  const label = getLabel(model);
  return (
    <td className="text-left align-middle" headers="m-name">
      {label}
      {writeMode && label === "Multistage" ? (
        <HelpTextPopover content={multistageHelpText} title={"note"} />
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

const ModelRow = observer(
  ({ store, model, columns, groupIndex = null, getLabel = getDisplayName }) => (
    <tr
      style={{
        backgroundColor:
          groupIndex != null && groupIndex % 2 !== 0 ? "#f8f9fa" : undefined,
      }}
    >
      <ModelHeaderTd
        model={model}
        writeMode={store.canEdit}
        getLabel={getLabel}
      />
      {columns.map((col) => {
        const modelOptions =
          allModelOptions?.[store.getModelType]?.[col.type] ?? [];
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
  ),
);

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

  let allModels;
  if (
    store.getModelType === mc.MODEL_CONTINUOUS &&
    activeTab === "loud_bayesian"
  ) {
    allModels = rowOrder[getModelType]["loud_bayesian"];
    return (
      <tbody>
        <tr>
          <LOUDAccordion
            store={store}
            allModels={allModels}
            columns={columns}
            accordionState={store.accordionState}
          />
        </tr>
      </tbody>
    );
  } else {
    if (store.getModelType === mc.MODEL_CONTINUOUS && activeTab === "mle") {
      allModels = rowOrder[getModelType]["mle"];
    } else {
      allModels = rowOrder[getModelType];
    }

    const getLabel =
      store.getModelType === mc.MODEL_DICHOTOMOUS &&
      (activeTab === "loud_bayesian" || activeTab === "toxicr_bayesian")
        ? (model) => bayesianDichotomousDisplayNames[model] ?? model
        : getDisplayName;
    return (
      <tbody>
        {allModels.map((model) => (
          <ModelRow
            key={model}
            store={store}
            model={model}
            columns={columns}
            getLabel={getLabel}
          />
        ))}
      </tbody>
    );
  }
});

ModelsCheckBox.propTypes = {
  store: PropTypes.any,
};

ModelHeaderTd.propTypes = {
  model: PropTypes.string.isRequired,
  writeMode: PropTypes.bool,
};

export default ModelsCheckBox;
