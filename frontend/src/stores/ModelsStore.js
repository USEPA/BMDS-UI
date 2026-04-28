import _ from "lodash";
import { action, computed, observable, reaction } from "mobx";

import * as mc from "@/constants/mainConstants";
import { allModelOptions, models } from "@/constants/modelConstants";

class ModelsStore {
  constructor(rootStore) {
    this.rootStore = rootStore;

    // Switch to 'loud' tab if currently on toxicr tab and Model Type is switched to continuous.
    reaction(
      () => this.getModelType,
      (type) => {
        if (type !== mc.MODEL_DICHOTOMOUS && this.activeTab === "toxicr") {
          this.setActiveTab("loud");
        }
      },
      { fireImmediately: true },
    );
  }

  @observable activeTab = "loud"; // 'loud' | 'toxicr' | 'mle'
  @action setActiveTab(tab) {
    this.activeTab = tab;
  }

  isActive(tab) {
    return this.activeTab === tab;
  }

  @observable model_headers = {};
  @observable models = {};
  @observable prior_weight = 1;

  @computed get canEdit() {
    return this.rootStore.mainStore.canEdit;
  }

  @action.bound setDefaultsByDatasetType(force) {
    if (this.numModelsSelected === 0 || force) {
      this.models = models[this.getModelType];
    }
  }

  @computed get numModelsSelected() {
    return _.chain(this.models)
      .values()
      .reduce((_sum, d) => d.length, 0)
      .value();
  }

  @computed get getModelType() {
    return this.rootStore.mainStore.model_type;
  }

  @action.bound setModels(models) {
    this.models = models;
    this.setDefaultsByDatasetType();
  }

  @action.bound enableAll(name, checked) {
    allModelOptions[this.getModelType][name].map((model) => {
      console.log(checked);
      this.setModelSelection(name, model, checked);
    });
  }

  @action.bound resetModelSelection() {
    this.setDefaultsByDatasetType(true);
    this.rootStore.mainStore.setInputsChangedFlag();
  }

  @action.bound setModelSelection(name, model, checked) {
    if (checked) {
      if (!(name in this.models)) {
        this.models[name] = [];
      }
      if (name === mc.BAYESIAN || name === mc.LOUD) {
        let bma = {
          model,
          prior_weight: 0,
        };
        let obj = this.models[name].find((obj) => obj.model === model);
        if (obj === undefined) {
          this.models[name].push(bma);
        }
        this.setDefaultPriorWeights(name);
      } else {
        if (!this.models[name].includes(model)) {
          this.models[name].push(model);
        }
      }
    } else {
      let index = -1;
      if (name === mc.BAYESIAN || name === mc.LOUD) {
        index = this.models[name].findIndex((obj) => obj.model === model);
        if (index > -1) {
          this.models[name].splice(index, 1);
          this.setDefaultPriorWeights(name);
        }
      } else {
        index = this.models[name].indexOf(model);
        if (index > -1) {
          this.models[name].splice(index, 1);
        }
      }

      if (!this.models[name].length) {
        delete this.models[name];
      }
    }
    this.rootStore.mainStore.setInputsChangedFlag();
  }

  @action.bound setDefaultPriorWeights(name) {
    const value = parseFloat(
      (this.prior_weight / this.models[name].length).toFixed(3),
    );
    this.models[name].forEach((obj) => {
      obj.prior_weight = value;
    });
  }

  @action.bound setPriorWeight(name, model, value) {
    let modelIndex = _.findIndex(this.models[name], (d) => d.model === model);
    if (modelIndex >= 0) {
      this.models[name][modelIndex].prior_weight = parseFloat(value);
    }
  }
}

export default ModelsStore;
