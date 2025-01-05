import {saveAs} from "file-saver";
import {action, computed, observable} from "mobx";

import {getHeaders} from "../../../common";
import {exampleData} from "./constants";

class Store {
    constructor(token) {
        this.token = token;
    }

    @observable settings = {
        dataset: "",
        species: "rat",
        design: "average",
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

    @action.bound
    reset() {
        this.settings = {
            dataset: "",
            species: "rat",
            design: "average",
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
