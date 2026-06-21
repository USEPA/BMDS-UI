import _ from "lodash";
import { action, observable } from "mobx";

import * as constant from "@/constants/MCMCConstants";

const createOption = () => {
  const option = _.cloneDeep(constant.options);
  return option;
};

class mcmcStore {
  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  @observable optionsDict = {};
  @observable resetCount = 0;

  @action.bound setDefaults(force) {
    if (_.isEmpty(this.optionsDict) || force) {
      this.optionsDict = createOption();
      this.resetCount++;
      this.rootStore.mainStore.setInputsChangedFlag();
    }
  }

  @action.bound saveOptions(name, value) {
    this.optionsDict[name] = value;
    this.rootStore.mainStore.setInputsChangedFlag();
  }

  @action.bound setOptions(options) {
    this.optionsDict = options ?? {};
    this.setDefaults();
    if (_.isEmpty(options)) {
      this.resetCount++;
    }
  }
}

export default mcmcStore;
