import {saveAs} from "file-saver";
import {action, computed, observable} from "mobx";

import {getBlob, getHeaders} from "../../../common";
import {exampleData} from "./data";

class Store {
    constructor(token) {
        this.token = token;
    }

    @observable settings = {
        dataset: "",
        dose_units: "ppm",
        power: 3,
        duration: Number.NaN,
    };
    @observable error = null;
    @observable errorObject = null;
    @observable outputs = null;

    @observable showAboutModal = false;
    @action.bound
    setAboutModal(value) {
        this.showAboutModal = value;
    }

    @action.bound
    updateSettings(key, value) {
        this.settings[key] = value;
    }

    @action.bound
    async submit() {
        const url = "/api/v1/polyk/";
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

    @computed get submissionRequest() {
        return {
            method: "POST",
            mode: "cors",
            headers: getHeaders(this.token),
            body: JSON.stringify(this.settings),
        };
    }

    @action.bound
    async downloadExcel() {
        const url = "/api/v1/polyk/excel/";
        await fetch(url, this.submissionRequest)
            .then(response => getBlob(response, "polyk.xlsx"))
            .then(({blob, filename}) => saveAs(blob, filename));
    }

    @action.bound
    async downloadWord() {
        const url = "/api/v1/polyk/word/";
        await fetch(url, this.submissionRequest)
            .then(response => getBlob(response, "polyk.docx"))
            .then(({blob, filename}) => saveAs(blob, filename));
    }

    @action.bound
    reset() {
        this.settings = {
            dataset: "",
            dose_units: "ppm",
            power: 3,
            duration: Number.NaN,
        };
        this.error = null;
        this.outputs = null;
    }

    @action.bound
    loadExampleData() {
        this.updateSettings("dataset", exampleData);
    }

    @action.bound
    downloadExampleData() {
        saveAs(new File([exampleData], "example-polyk.csv", {type: "text/csv"}));
    }
}

export default Store;
