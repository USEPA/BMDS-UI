import _ from "lodash";
import { action, observable } from "mobx";

import * as constant from "@/constants/MCMCConstants";

const createOption = () => {
  const option = _.cloneDeep(constant.options);
  return option;
};

class MCMCStore {
  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  @observable optionsList = [];
  @observable resetCount = 0;

  @action.bound setDefaults(force) {
    if (this.optionsList.length === 0 || force) {
      this.optionsList = [createOption()];
      this.resetCount++;
    }
  }

  @action.bound saveOptions(name, value, id) {
    this.optionsList[id][name] = value;
    this.rootStore.mainStore.setInputsChangedFlag();
  }

  @action.bound setOptions(options) {
    this.optionsList = options ?? [];
    this.setDefaults();
  }
}

export default MCMCStore;
