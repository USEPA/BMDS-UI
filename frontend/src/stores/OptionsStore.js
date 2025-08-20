import _ from "lodash";
import {action, computed, observable} from "mobx";

import {MODEL_CONTINUOUS, MODEL_NESTED_DICHOTOMOUS} from "@/constants/mainConstants";
import * as constant from "@/constants/optionsConstants";

const createOption = modelType => {
    const option = _.cloneDeep(constant.options[modelType]);
    if (modelType === MODEL_NESTED_DICHOTOMOUS) {
        // set seed to random number
        option.bootstrap_seed = Math.ceil(Math.random() * 1000);
    }
    return option;
};

class OptionsStore {
    constructor(rootStore) {
        this.rootStore = rootStore;
    }

    @observable optionsList = [];

    @computed get canEdit() {
        return this.rootStore.mainStore.canEdit;
    }

    @action.bound setDefaultsByDatasetType(force) {
        if (this.optionsList.length === 0 || force) {
            this.optionsList = [createOption(this.getModelType)];
        }
    }

    @action.bound addOptions() {
        this.optionsList.push(createOption(this.getModelType));
        this.rootStore.mainStore.setInputsChangedFlag();
    }

    @action.bound saveOptions(name, value, id) {
        this.optionsList[id][name] = value;
        this.rootStore.mainStore.setInputsChangedFlag();
        if (name === constant.BMR_TYPE && this.getModelType === MODEL_CONTINUOUS) {
            //  change default BMR value if the BMR type was changed for continuous datasets
            this.optionsList[id][constant.BMR_VALUE] = constant.bmrForBmrTypeContinuous[value];
        }
    }

    @action.bound deleteOptions(val) {
        this.optionsList.splice(val, 1);
        this.rootStore.mainStore.setInputsChangedFlag();
    }

    @action.bound setOptions(options) {
        this.optionsList = options;
        this.setDefaultsByDatasetType();
    }

    @computed get getModelType() {
        return this.rootStore.mainStore.model_type;
    }

    @computed get maxItems() {
        return this.rootStore.mainStore.isDesktop
            ? 1000
            : this.rootStore.mainStore.isMultiTumor
              ? 3
              : 6;
    }

    @computed get canAddNewOption() {
        return this.optionsList.length < this.maxItems;
    }
}

export default OptionsStore;
