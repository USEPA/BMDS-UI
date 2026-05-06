import _ from "lodash";
import { action, computed, observable, reaction } from "mobx";

import * as mc from "@/constants/mainConstants";
import { allModelOptions, models } from "@/constants/modelConstants";

const model_subtypes = [
  "toxicr_bayesian",
  "loud_bayesian",
  "frequentist_restricted",
  "frequentist_unrestricted",
];

const frequentist_model_types = [
  "frequentist_restricted",
  "frequentist_unrestricted",
];

class ModelsStore {
  constructor(rootStore) {
    this.rootStore = rootStore;

    // Switch to 'loud_bayesian' tab if currently on toxicr tab and Model Type is switched to continuous.
    reaction(
      () => this.getModelType,
      (type) => {
        if (
          type !== mc.MODEL_DICHOTOMOUS &&
          this.activeTab === "toxicr_bayesian"
        ) {
          this.setActiveTab("loud_bayesian");
        }
      },
      { fireImmediately: true },
    );
  }

  @observable activeTab = "loud_bayesian"; // 'loud_bayesian' | 'toxicr_bayesian' | 'mle'
  @action setActiveTab(tab) {
    this.activeTab = tab;
  }

  isActive(tab) {
    return this.activeTab === tab;
  }

  hasTabs() {
    return (
      this.getModelType === mc.MODEL_CONTINUOUS ||
      this.getModelType === mc.MODEL_DICHOTOMOUS
    );
  }

  @observable tabBadge = {
    loud_bayesian: null,
    toxicr_bayesian: null,
    mle: null,
  };

  @action setTabBadge(model_subtype) {
    if (!this.hasTabs()) {
      return;
    }

    // Sum up the number of frequentist restricted and frequentist unrestricted models to display on the MLE tab.
    if (frequentist_model_types.includes(model_subtype)) {
      let frequentist_sum = 0;
      frequentist_model_types.forEach((model) => {
        frequentist_sum += this.models?.[model]?.length ?? 0;
      });

      this.tabBadge["mle"] = frequentist_sum;
    } else {
      this.tabBadge[model_subtype] = this.models?.[model_subtype]?.length ?? 0;
    }
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

    if (!this.hasTabs()) {
      return;
    } else {
      model_subtypes.forEach((subtype) => this.setTabBadge(subtype));
    }
  }

  @action.bound setDefaultsForCurrentTab() {
    if (!this.hasTabs()) {
      this.models = models[this.getModelType];
      return;
    } else if (
      this.activeTab === "loud_bayesian" ||
      this.activeTab === "toxicr_bayesian"
    ) {
      delete this.models[this.activeTab];
      this.setTabBadge(this.activeTab);
    } else if (this.activeTab === "mle") {
      frequentist_model_types.forEach((model) => {
        this.models[model] = models[this.getModelType][model];
        this.setTabBadge(model);
      });
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
      this.setModelSelection(name, model, checked);
    });
    this.setTabBadge(name);
  }

  @action.bound resetModelSelection() {
    this.setDefaultsForCurrentTab();
    this.rootStore.mainStore.setInputsChangedFlag();
  }

  @action.bound setModelSelection(name, model, checked) {
    if (checked) {
      if (!(name in this.models)) {
        this.models[name] = [];
      }
      if (name === mc.TOXICR_BAYESIAN || name === mc.LOUD_BAYESIAN) {
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
      if (name === mc.TOXICR_BAYESIAN || name === mc.LOUD_BAYESIAN) {
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
    console.log(this.models);
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

  @action.bound setPriorWeight(type, model, value) {
    let modelIndex = _.findIndex(this.models[type], (d) => d.model === model);
    if (modelIndex >= 0) {
      this.models[type][modelIndex].prior_weight = parseFloat(value);
    }
  }
}

export default ModelsStore;
