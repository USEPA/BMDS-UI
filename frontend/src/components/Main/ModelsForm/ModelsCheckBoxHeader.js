import { observer } from "mobx-react";
import PropTypes from "prop-types";
import React from "react";

import * as mc from "@/constants/mainConstants";
import { allModelOptions } from "@/constants/modelConstants";

import Button from "../../common/Button";
import CheckboxInput from "../../common/CheckboxInput";
import LabelInput from "../../common/LabelInput";

const areAllModelsChecked = function (modelType, type, models) {
    console.log(
      "areAllModelsChecked: ",
      type in models &&
        models[type].length === allModelOptions[modelType][type].length,
    );
    return (
      type in models &&
      models[type].length === allModelOptions[modelType][type].length
    );
  },
  SelectAllComponent = observer((props) => {
    const { store, type, disabled, label } = props,
      id = `select_all_${type}`;
    return (
      <>
        <CheckboxInput
          id={id}
          disabled={disabled}
          onChange={(value) => store.enableAll(type, value)}
          checked={areAllModelsChecked(store.getModelType, type, store.models)}
        />
        &nbsp;
        <LabelInput label={label} htmlFor={id} />
      </>
    );
  });

const ModelsCheckBoxHeader = observer((props) => {
  const { store } = props;
  const activeTab =
    store.getModelType == mc.MODEL_NESTED_DICHOTOMOUS ? "mle" : store.activeTab;

  const activeTabToTitle = {
    loud: "Loud Bayesian Model Averaging",
    mle: "Maximum Likelihood Estimate",
    toxicr: "ToxicR Bayesian Model Averaging",
  };
  return (
    <>
      <thead className="bg-custom">
        <tr>
          <th className="align-top" rowSpan="2" id="m-name">
            Model
            {store.canEdit ? (
              <>
                <Button
                  className="mt-4 btn btn-sm btn-block btn-info"
                  onClick={store.resetModelSelection}
                  text="Reset Selection"
                />
              </>
            ) : null}
          </th>
          <th colSpan="2">{activeTabToTitle[activeTab]}</th>
        </tr>
        <tr>
          {activeTab === "mle" ? (
            <>
              <th id="mle-r">
                Restricted
                {store.canEdit ? (
                  <>
                    <br />
                    <SelectAllComponent
                      store={store}
                      key={"mle-frequentist_restricted"}
                      type={"frequentist_restricted"}
                      label="Select All"
                    />
                  </>
                ) : null}
              </th>
              <th id="mle-ur">
                Unrestricted
                {store.canEdit ? (
                  <>
                    <br />
                    <SelectAllComponent
                      store={store}
                      key={"mle-frequentist_unrestricted"}
                      type={"frequentist_unrestricted"}
                      label="Select All"
                    />
                  </>
                ) : null}
              </th>
            </>
          ) : activeTab === "loud" ? (
            <>
              <th id="l-i">
                Include
                {store.canEdit ? (
                  <>
                    <br />
                    <SelectAllComponent
                      store={store}
                      key={"loud"}
                      type={"loud"}
                      label="Select All"
                    />
                  </>
                ) : null}
              </th>
              <th id="l-p">
                <span className="mb-1">Prior Weight</span>
              </th>
            </>
          ) : activeTab === "toxicr" ? (
            <>
              <th id="b-i">
                Include
                {store.canEdit ? (
                  <>
                    <br />
                    <SelectAllComponent
                      store={store}
                      key={"bayesian"}
                      type={"bayesian"}
                      label="Select All"
                    />
                  </>
                ) : null}
              </th>
              <th id="b-p">
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
