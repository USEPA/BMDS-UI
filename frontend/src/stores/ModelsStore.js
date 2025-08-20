import _ from "lodash";
import {action, computed, observable} from "mobx";

import * as mc from "@/constants/mainConstants";
import {allModelOptions, models} from "@/constants/modelConstants";

class ModelsStore {
    constructor(rootStore) {
        this.rootStore = rootStore;
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
        allModelOptions[this.getModelType][name].map(model => {
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
            if (name === mc.BAYESIAN) {
                const bma = {
                    model,
                    prior_weight: 0,
                };
                const obj = this.models[name].find(obj => obj.model === model);
                if (obj === undefined) {
                    this.models[name].push(bma);
                }
                this.setDefaultPriorWeights();
            } else {
                if (!this.models[name].includes(model)) {
                    this.models[name].push(model);
                }
            }
        } else {
            let index = -1;
            if (name === mc.BAYESIAN) {
                index = this.models[name].findIndex(obj => obj.model === model);
                if (index > -1) {
                    this.models[name].splice(index, 1);
                    this.setDefaultPriorWeights();
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

    @action.bound setDefaultPriorWeights() {
        const value = Number.parseFloat(
            (this.prior_weight / this.models[mc.BAYESIAN].length).toFixed(3)
        );
        this.models[mc.BAYESIAN].forEach(obj => {
            obj.prior_weight = value;
        });
    }

    @action.bound setPriorWeight(model, value) {
        const modelIndex = _.findIndex(this.models[mc.BAYESIAN], d => d.model === model);
        if (modelIndex >= 0) {
            this.models[mc.BAYESIAN][modelIndex].prior_weight = Number.parseFloat(value);
        }
    }
}

export default ModelsStore;
