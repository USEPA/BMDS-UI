import {saveAs} from "file-saver";
import _ from "lodash";
import {action, computed, observable} from "mobx";

import {getBlob, getHeaders} from "../../../common";
import {exampleData} from "./constants";

class Store {
    constructor(token) {
        this.token = token;
    }

    @observable settings = {
        dataset: "",
        species: "rat",
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
        saveAs(new File([exampleData], "example-polyk.csv", {type: "text/csv"}));
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
        const url = "/api/v1/rao-scott/";
        this.error = null;
        await fetch(url, this.submissionRequest)
            .then(response => {
                if (response.ok) {
                    response.json().then(data => {
                        this.outputs = data;
                    });
                } else {
                    response
                        .json()
                        .then(data => {
                            this.error = true;
                            console.error(data);
                            try {
                                this.error = JSON.parse(data);
                            } catch (err) {
                                console.error(err);
                            }
                        })
                        .catch(error => {
                            this.error = true;
                            console.error(error);
                        });
                }
            })
            .catch(error => {
                this.error = true;
                console.error(error);
            });
    }

    @computed get clipboardData() {
        const {df} = this.outputs;
        return _.zip(df.dose, df.n_adjusted, df.incidence_adjusted)
            .map(d => `${d[0]}\t${d[1].toFixed(4)}\t${d[2]}`)
            .join("\n");
    }

    @action.bound
    async downloadExcel() {
        const url = "/api/v1/rao-scott/excel/";
        await fetch(url, this.submissionRequest)
            .then(response => getBlob(response))
            .then(({blob, filename}) => saveAs(blob, filename));
    }

    @action.bound
    async downloadWord() {
        const url = "/api/v1/rao-scott/word/";
        await fetch(url, this.submissionRequest)
            .then(response => getBlob(response))
            .then(({blob, filename}) => saveAs(blob, filename));
    }

    @action.bound
    reset() {
        this.settings = {
            dataset: "",
            species: "rat",
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
