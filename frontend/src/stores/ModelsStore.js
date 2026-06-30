import _ from "lodash";
import { action, computed, observable, reaction } from "mobx";

import * as mc from "@/constants/mainConstants";
import {
  allModelOptions,
  models,
  mutuallyExclusive,
  parseDisplayName,
} from "@/constants/modelConstants";

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
          type === mc.MODEL_MULTI_TUMOR ||
          type == mc.MODEL_NESTED_DICHOTOMOUS
        ) {
          this.setActiveTab("mle");
        } else if (
          type === mc.MODEL_CONTINUOUS &&
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

  @observable expandAllTrigger = 0;
  @observable accordionState = {
    bmds: true,
    extended: false,
  };

  @action.bound setAccordionState(card, isExpanded) {
    this.accordionState[card] = isExpanded;
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

  col_widths = ["30%", "20%", "50%"];

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

  @computed get hasLoudBayesian() {
    return (this.models?.loud_bayesian?.length ?? 0) > 0;
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
      this.models[this.activeTab] =
        models[this.getModelType][this.activeTab] ?? [];
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
      .reduce((sum, d) => sum + d.length, 0)
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

    if (name === mc.LOUD_BAYESIAN && checked) {
      this.expandAllTrigger += 1;
    }
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
        const { baseModel, dist_type } =
          name === mc.LOUD_BAYESIAN
            ? parseDisplayName(model)
            : { baseModel: model, dist_type: undefined };
        let bma = {
          model: baseModel,
          dist_type,
          prior_weight: 0,
          _displayName: model,
        };
        let obj = this.models[name].find((obj) => obj._displayName === model);
        if (obj === undefined) {
          this.models[name].push(bma);
        }
        if (name === mc.LOUD_BAYESIAN && model in mutuallyExclusive) {
          mutuallyExclusive[model].forEach((exclusiveModel) => {
            const index = this.models[name].findIndex(
              (obj) => obj._displayName === exclusiveModel,
            );
            if (index > -1) {
              this.models[name].splice(index, 1);
            }
          });
        }
        this.setDefaultPriorWeights(name);

        // Prune option sets if loud_bayesian models are included and over the limit
        if (name === mc.LOUD_BAYESIAN) {
          this.rootStore.optionsStore.pruneToMaxItems();
          this.rootStore.dataStore.pruneToMaxItems();
        }
      } else {
        if (!this.models[name].includes(model)) {
          this.models[name].push(model);
        }
      }
    } else {
      let index = -1;
      if (name === mc.TOXICR_BAYESIAN || name === mc.LOUD_BAYESIAN) {
        index = this.models[name].findIndex(
          (obj) => obj._displayName === model,
        );
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
      (this.prior_weight / this.models[name].length).toFixed(4),
    );
    this.models[name].forEach((obj) => {
      obj.prior_weight = value;
    });
  }

  @action.bound setPriorWeight(type, model, value) {
    let modelIndex = _.findIndex(
      this.models[type],
      (d) => d._displayName === model,
    );
    if (modelIndex >= 0) {
      this.models[type][modelIndex].prior_weight = parseFloat(value);
    }
    this.rootStore.mainStore.setInputsChangedFlag();
  }
}

export default ModelsStore;
