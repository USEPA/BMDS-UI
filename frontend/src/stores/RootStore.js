import DataStore from "./DataStore";
import DatasetModelOptionStore from "./DatasetModelOptionStore";
import LogicStore from "./LogicStore";
import MainStore from "./MainStore";
import ModelsStore from "./ModelsStore";
import OptionsStore from "./OptionsStore";
import MCMCOptionsStore from "./MCMCOptionsStore";
import OutputStore from "./OutputStore";

class RootStore {
  constructor() {
    this.mainStore = new MainStore(this);
    this.dataStore = new DataStore(this);
    this.dataOptionStore = new DatasetModelOptionStore(this);
    this.optionsStore = new OptionsStore(this);
    this.MCMCOptionsStore = new MCMCOptionsStore(this);
    this.modelsStore = new ModelsStore(this);
    this.outputStore = new OutputStore(this);
    this.logicStore = new LogicStore(this);
  }
}

const rootStore = new RootStore();
export default rootStore;
