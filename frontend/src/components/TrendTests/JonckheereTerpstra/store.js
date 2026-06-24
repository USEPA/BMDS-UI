import { saveAs } from "file-saver";
import _ from "lodash";
import { action, computed, observable } from "mobx";

import { getBlob, getHeaders, toCSV, parseCSVToObjects } from "../../../common";
import { exampleDataIndividual, exampleDataSummary } from "./constants";
class Store {
  constructor(token) {
    this.token = token;
    this.selected_dataset = JSON.parse(
      localStorage.getItem("selected_dataset"),
    );
    this.model_type = this.selected_dataset.metadata.model_type;

    this.columns = null;
    if (this.model_type === "I") {
      this.exampleData = exampleDataIndividual;
      this.columns = ["doses", "responses"];
    } else if (this.model_type === "CS") {
      this.exampleData = exampleDataSummary;
      this.columns = ["doses", "ns", "means", "stdevs"];
    }

    this.selected_data = toCSV(this.selected_dataset, this.columns);
  }

  @observable settings = {
    dataset_obj: Object.fromEntries(
      this.columns.map((col) => [col, this.selected_dataset[col]]),
    ),
    dataset: this.selected_data,
    hypothesis: "increasing",
    nperm: null,
    model_type: this.model_type,
  };
  @observable error = null;
  @observable errorObject = null;
  @observable outputs = null;

  @action.bound
  updateSettings(key, value) {
    this.settings[key] = value;
  }

  @action.bound
  loadExampleData() {
    this.updateSettings("dataset", this.exampleData);
    const parsed_example_data = parseCSVToObjects(
      this.exampleData,
      this.columns,
    );
    this.updateSettings(
      "dataset_obj",
      Object.fromEntries(
        this.columns.map((col) => [col, parsed_example_data[col]]),
      ),
    );
  }

  @action.bound
  downloadExampleData() {
    saveAs(
      new File([this.exampleData], "example-jonckheere.csv", {
        type: "text/csv",
      }),
    );
  }

  @computed get submissionRequest() {
    return {
      method: "POST",
      mode: "cors",
      headers: getHeaders(this.token),
      body: JSON.stringify(this.settings),
    };
  }

  @action.bound
  async submit() {
    // dataset_obj should represent the last-analyzed dataset.
    const parsed = parseCSVToObjects(this.settings.dataset, this.columns);
    this.updateSettings(
      "dataset_obj",
      Object.fromEntries(this.columns.map((col) => [col, parsed[col]])),
    );

    const url = "/api/v1/jonckheere-terpstra/";
    this.error = null;
    await fetch(url, this.submissionRequest)
      .then((response) => {
        if (response.ok) {
          response.json().then((data) => {
            this.outputs = data;
          });
        } else {
          response
            .json()
            .then((data) => {
              this.error = true;
              console.error(data);
              try {
                this.error = JSON.parse(data);
              } catch (err) {
                console.error(err);
              }
            })
            .catch((error) => {
              this.error = true;
              console.error(error);
            });
        }
      })
      .catch((error) => {
        this.error = true;
        console.error(error);
      });
  }

  @computed get clipboardData() {
    const answer = this.outputs.answer;

    const result_string = Object.entries(answer)
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n");

    return result_string;
  }

  @computed get reportRequest() {
    return {
      method: "POST",
      mode: "cors",
      headers: getHeaders(this.token),
      body: JSON.stringify({
        ...this.settings,
        computed_result: this.outputs?.answer ?? null,
        synthetic_dataset_obj: this.outputs?.synthetic_dataset_obj ?? null,
      }),
    };
  }

  @action.bound
  async downloadExcel() {
    const url = "/api/v1/jonckheere-terpstra/excel/";
    await fetch(url, this.reportRequest)
      .then((response) => {
        return getBlob(response, "result.xlsx");
      })
      .then(({ blob, filename }) => saveAs(blob, filename));
  }

  @action.bound
  async downloadWord() {
    const url = "/api/v1/jonckheere-terpstra/word/";
    await fetch(url, this.reportRequest)
      .then((response) => {
        return getBlob(response, "result.docx");
      })
      .then(({ blob, filename }) => saveAs(blob, filename));
  }

  @action.bound
  reset() {
    this.selected_dataset = JSON.parse(
      localStorage.getItem("selected_dataset"),
    );

    this.settings = {
      dataset_obj: Object.fromEntries(
        this.columns.map((col) => [col, this.selected_dataset[col]]),
      ),
      dataset: this.selected_data,
      hypothesis: "increasing",
      model_type: this.model_type,
    };
    this.error = null;
    this.outputs = null;
  }

  @observable showAboutModal = false;
  @action.bound
  setAboutModal(value) {
    this.showAboutModal = value;
  }
}

export default Store;
