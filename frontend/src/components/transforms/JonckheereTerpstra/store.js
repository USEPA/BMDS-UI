import { saveAs } from "file-saver";
import _ from "lodash";
import { action, computed, observable } from "mobx";

import { getBlob, getHeaders } from "../../../common";
import { exampleData } from "./constants";
class Store {
  constructor(token) {
    this.token = token;
    this.selected_dataset = JSON.parse(
      localStorage.getItem("selected_dataset"),
    );

    function toCSV(data, headers) {
      return (
        headers.join(",") +
        "\n" +
        Array.from({ length: data[headers[0]].length }, (_, i) =>
          headers.map((key) => data[key][i]).join(","),
        ).join("\n")
      );
    }

    if (this.selected_dataset.metadata.model_type === "I") {
      this.selected_data = toCSV(this.selected_dataset, ["doses", "responses"]);
    } else if (this.selected_dataset.metadata.model_type === "CS") {
      this.selected_data = toCSV(this.selected_dataset, [
        "doses",
        "ns",
        "means",
        "stdevs",
      ]);
    }
  }

  @observable settings = {
    dataset: this.selected_data,
    hypothesis: "increasing",
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
    this.updateSettings("dataset", exampleData);
  }

  @action.bound
  downloadExampleData() {
    saveAs(
      new File([exampleData], "example-jonckheere.csv", { type: "text/csv" }),
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

  @action.bound
  async downloadExcel() {
    const url = "/api/v1/jonckheere-terpstra/excel/";
    await fetch(url, this.submissionRequest)
      .then((response) => getBlob(response))
      .then(({ blob, filename }) => saveAs(blob, filename));
  }

  @action.bound
  async downloadWord() {
    const url = "/api/v1/jonckheere-terpstra/word/";
    await fetch(url, this.submissionRequest)
      .then((response) => getBlob(response))
      .then(({ blob, filename }) => saveAs(blob, filename));
  }

  @action.bound
  reset() {
    this.settings = {
      dataset: this.selected_data,
      hypothesis: "increasing",
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
