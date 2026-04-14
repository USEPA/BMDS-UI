import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import _ from "lodash";
import { action, computed, observable } from "mobx";

import { getBlob, getHeaders } from "../../../common";
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

    this.selected_data = this.toCSV(this.selected_dataset, this.columns);
  }

  @observable settings = {
    dataset: this.selected_data,
    hypothesis: "increasing",
    model_type: this.model_type,
  };
  @observable error = null;
  @observable errorObject = null;
  @observable outputs = null;

  parseCSVToObjects(csv, columns) {
    if (
      typeof csv !== "string" ||
      !Array.isArray(columns) ||
      columns.length === 0
    ) {
      return {};
    }

    const lines = csv.split(/\r?\n/);

    const headerMatches =
      lines.length > 0 &&
      lines[0].split(",").length === columns.length &&
      lines[0] === columns.join(",");

    const dataLines = headerMatches ? lines.slice(1) : lines;

    const result = {};
    columns.forEach((key) => (result[key] = []));

    for (const line of dataLines) {
      if (line.length === 0) continue; // skip completely empty lines
      const cells = line.split(",");
      for (let i = 0; i < columns.length; i++) {
        const raw = cells[i] !== undefined ? cells[i] : "";
        result[columns[i]].push(raw === "" || /^na$/i.test(raw) ? null : raw);
      }
    }

    return result;
  }

  toCSV(data, headers) {
    const rows = Array.from({ length: data[headers[0]].length }, (_, i) =>
      headers.map((key) => data[key][i]),
    );

    const filteredRows = rows.filter((row) => {
      return (
        Array.isArray(row) && row.some((cell) => cell !== "" && cell !== null)
      );
    });

    return (
      headers.join(",") +
      "\n" +
      filteredRows.map((row) => row.join(",")).join("\n")
    );
  }

  @action.bound
  updateSettings(key, value) {
    this.settings[key] = value;
  }

  @action.bound
  loadExampleData() {
    this.updateSettings("dataset", this.exampleData);
    this.selected_dataset = this.parseCSVToObjects(
      this.exampleData,
      this.columns,
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
      .then((response) => {
        return getBlob(response, "result.xlsx");
      })
      .then(async ({ blob, filename }) => {
        const columns = this.columns;
        const rows = this.selected_dataset[columns[0]].map((_, i) =>
          Object.fromEntries(
            columns.map((col) => [col, this.selected_dataset[col][i]]),
          ),
        );
        const arrayBuffer = await blob.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: "array" });

        // Rename the first sheet to 'results'
        const firstSheet = workbook.Sheets["Sheet1"];
        delete workbook.Sheets["Sheet1"];
        workbook.Sheets["results"] = firstSheet;
        workbook.SheetNames[0] = "results";

        const worksheet = XLSX.utils.json_to_sheet(rows);
        XLSX.utils.book_append_sheet(workbook, worksheet, "Dataset");

        XLSX.writeFile(workbook, filename);
      });
  }

  @action.bound
  async downloadWord() {
    const url = "/api/v1/jonckheere-terpstra/word/";
    await fetch(url, this.submissionRequest)
      .then((response) => {
        return getBlob(response, "result.xlsx");
      })
      .then(({ blob, filename }) => saveAs(blob, filename));
  }

  @action.bound
  reset() {
    this.selected_dataset = JSON.parse(
      localStorage.getItem("selected_dataset"),
    );

    this.settings = {
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
