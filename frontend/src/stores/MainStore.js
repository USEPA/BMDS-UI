import {saveAs} from "file-saver";
import _ from "lodash";
import {action, computed, observable, toJS} from "mobx";
import slugify from "slugify";

import {getHeaders, simulateClick} from "@/common";
import * as mc from "@/constants/mainConstants";
import {parseServerErrors} from "@/utils/parsers";

class MainStore {
    constructor(rootStore) {
        this.rootStore = rootStore;
    }

    @observable config = {};

    @observable analysis_name = "";
    @observable analysis_description = "";
    @observable model_type = null;
    @observable errorMessage = null;
    @observable errorData = null;
    @observable hasEditSettings = false;
    @observable executionOutputs = null;
    @observable isUpdateComplete = false;

    @action.bound setConfig(config) {
        this.config = config;
    }
    @action.bound changeAnalysisName(value) {
        this.analysis_name = value;
        this.setInputsChangedFlag();
    }
    @action.bound changeAnalysisDescription(value) {
        this.analysis_description = value;
        this.setInputsChangedFlag();
    }
    @action.bound changeDatasetType(value) {
        this.model_type = value;
        // word export options setting
        if (this.isMultiTumorOrNestedDichotomous) {
            this.changeReportOptions("datasetFormatLong", false);
        }
        this.rootStore.modelsStore.setDefaultsByDatasetType(true);
        this.rootStore.optionsStore.setDefaultsByDatasetType(true);
        this.rootStore.dataStore.setDefaultsByDatasetType();
        this.rootStore.dataOptionStore.options = [];
        this.setInputsChangedFlag();
    }
    @action.bound resetModelSelection() {
        this.rootStore.modelsStore.resetModelSelection();
    }

    @computed get getOptions() {
        return this.rootStore.optionsStore.optionsList;
    }

    @computed get getEnabledDatasets() {
        return this.rootStore.dataStore.getEnabledDatasets;
    }
    @computed get getPayload() {
        const editKey = this.config.editSettings ? this.config.editSettings.editKey : null;
        return {
            editKey,
            partial: true,
            data: {
                analysis_name: this.analysis_name,
                analysis_description: this.analysis_description,
                dataset_type: this.model_type,
                models: this.rootStore.modelsStore.models,
                datasets: this.rootStore.dataStore.datasets,
                dataset_options: this.rootStore.dataOptionStore.options,
                options: this.getOptions,
                recommender: this.rootStore.logicStore.logic,
            },
        };
    }
    @computed get isMultiTumor() {
        return this.model_type === mc.MODEL_MULTI_TUMOR;
    }

    @computed get isMultiTumorOrNestedDichotomous() {
        return this.model_type === "ND" || this.model_type === "MT";
    }

    @action.bound
    async saveAnalysis() {
        this.rootStore.dataStore.cleanRows();
        const url = this.config.editSettings.patchInputUrl,
            {csrfToken} = this.config.editSettings;
        this.errorMessage = "";
        this.errorData = null;
        await fetch(url, {
            method: "PATCH",
            mode: "cors",
            headers: getHeaders(csrfToken),
            body: JSON.stringify(this.getPayload),
        })
            .then(response => {
                if (response.ok) {
                    response.json().then(data => this.updateModelStateFromApi(data));
                } else {
                    response.json().then(errorText => {
                        const error = parseServerErrors(errorText);
                        this.errorMessage = error.message;
                        this.errorData = error.data;
                    });
                }
            })
            .catch(error => {
                this.errorMessage = error;
            });
    }

    @observable analysisSaved = false;
    @observable analysisValidated = false;
    @observable isExecuting = false;

    @action.bound
    async executeAnalysis() {
        if (!this.analysisSavedAndValidated) {
            // don't execute if we're not ready
            return;
        }
        if (this.isExecuting) {
            // don't execute if we're already executing
            return;
        }
        this.isExecuting = true;
        this.errorMessage = "";

        const apiUrl = this.config.apiUrl,
            {csrfToken} = this.config.editSettings,
            pollInterval = this.pollInterval,
            handleServerError = error => {
                console.error("error", error);
                if (error.status == 500) {
                    this.errorMessage =
                        "A server error occurred... if the error continues or your analysis does not complete please contact us.";
                    return;
                }
                this.errorMessage = error;
            },
            pollForResults = () => {
                fetch(apiUrl, {
                    method: "GET",
                    mode: "cors",
                })
                    .then(response => {
                        if (!response.ok) {
                            throw response;
                        }
                        return response.json();
                    })
                    .then(data => {
                        if (data.is_executing) {
                            setTimeout(pollForResults, pollInterval);
                        } else {
                            this.updateModelStateFromApi(data);
                            simulateClick(document.getElementById("navlink-output"));
                        }
                    })
                    .catch(handleServerError);
            };

        await fetch(this.config.editSettings.executeUrl, {
            method: "POST",
            mode: "cors",
            headers: getHeaders(csrfToken),
            body: JSON.stringify({
                editKey: this.config.editSettings.editKey,
            }),
        })
            .then(response => {
                if (!response.ok) {
                    throw response;
                }
                return response.json();
            })
            .then(data => {
                if (data.is_executing) {
                    setTimeout(pollForResults, pollInterval);
                } else {
                    this.updateModelStateFromApi(data);
                    simulateClick(document.getElementById("navlink-output"));
                }
            })
            .catch(handleServerError);
    }
    @action.bound
    async executeResetAnalysis() {
        const {csrfToken, executeResetUrl} = this.config.editSettings;
        await fetch(executeResetUrl, {
            method: "POST",
            mode: "cors",
            headers: getHeaders(csrfToken),
            body: JSON.stringify({
                editKey: this.config.editSettings.editKey,
            }),
        })
            .then(response => response.json())
            .then(data => {
                this.isExecuting = false;
                this.errorMessage = "";
                this.updateModelStateFromApi(data);
            })
            .catch(error => {
                this.errorMessage = error;
                console.error("error", error);
            });
    }
    @action.bound
    async fetchSavedAnalysis() {
        const apiUrl = this.config.apiUrl;
        this.errorMessage = "";
        await fetch(apiUrl, {
            method: "GET",
            mode: "cors",
        })
            .then(response => response.json())
            .then(data => this.updateModelStateFromApi(data))
            .catch(error => {
                this.errorMessage = error;
                console.error("error", error);
            });
    }
    @action.bound setInputsChangedFlag() {
        // inputs have changed and have not yet been saved or validated; prevent execution
        this.analysisSaved = false;
        this.analysisValidated = false;
    }
    @action.bound updateModelStateFromApi(data) {
        const errors = parseServerErrors(data.errors);
        if (errors) {
            this.errorMessage = errors.message;
            this.isUpdateComplete = true;
        }

        const inputs = data.inputs;
        if (_.isEmpty(inputs)) {
            this.changeDatasetType(this.model_type);
            this.isUpdateComplete = true;
            return;
        }

        this.isExecuting = data.is_executing;
        if (data.outputs) {
            this.executionOutputs = data.outputs.outputs;
        }
        // unpack general settings
        this.analysis_name = inputs.analysis_name;
        this.analysis_description = inputs.analysis_description;
        this.model_type = inputs.dataset_type;
        this.changeDatasetType(this.model_type);
        this.rootStore.optionsStore.setOptions(inputs.options);
        this.rootStore.dataStore.setDatasets(inputs.datasets);
        this.rootStore.dataOptionStore.setDatasetOptions(inputs.dataset_options);
        this.rootStore.modelsStore.setModels(inputs.models);
        this.rootStore.logicStore.setLogic(inputs.recommender);
        this.starred = data.starred;
        this.collections = data.collections;
        this.isUpdateComplete = true;
        this.analysisSaved = data.inputs_valid;
        this.analysisValidated = data.inputs_valid;
    }
    @action.bound loadAnalysisFromFile(file) {
        const {csrfToken} = this.config.editSettings,
            reader = new FileReader(),
            migrateUrl = "/api/v1/analysis/migrate/";
        reader.onload = e => {
            let payload;
            try {
                payload = {data: JSON.parse(e.target.result)};
            } catch {
                this.showToast(
                    "Error - Cannot Load File",
                    `The data from ${file.name} is not a JSON file.`
                );
                window.setTimeout(this.hideToast, 5000);
                return;
            }
            fetch(migrateUrl, {
                method: "POST",
                mode: "cors",
                headers: getHeaders(csrfToken),
                body: JSON.stringify(payload),
            })
                .then(response => response.json())
                .then(data => {
                    this.updateModelStateFromApi(data.analysis);
                    this.analysisValidated = true;
                    this.analysisSaved = false;
                    this.showToast(
                        `${file.name} Loaded`,
                        "Analysis loaded and shown in user interface, but is not saved."
                    );
                    window.setTimeout(this.hideToast, 5000);
                })
                .catch(error => {
                    this.showToast(
                        "Error - Cannot Load File",
                        `The data from ${file.name} this analysis file could not be loaded.`
                    );
                    window.setTimeout(this.hideToast, 5000);
                    console.error(error);
                });
        };
        reader.readAsText(file);
    }
    @action.bound async saveAnalysisToFile() {
        const apiUrl = this.config.apiUrl;
        await fetch(apiUrl, {
            method: "GET",
            mode: "cors",
        })
            .then(response => response.json())
            .then(json => {
                const fn = json.inputs.analysis_name ? slugify(json.inputs.analysis_name) : json.id,
                    file = new File([JSON.stringify(json, null, 2)], `${fn}.json`, {
                        type: "application/json",
                    });
                saveAs(file);
            });
    }

    @computed get analysisSavedAndValidated() {
        return this.analysisSaved && this.analysisValidated;
    }
    @computed get canSelectModel() {
        return this.canEdit && this.hasOutputs && this.analysisSavedAndValidated;
    }
    @computed get canEdit() {
        return this.config.editSettings !== undefined;
    }
    @computed get isFuture() {
        return this.config.future;
    }
    @computed get isDesktop() {
        return this.config.is_desktop;
    }
    @computed get pollInterval() {
        return this.isDesktop ? 1000 : 5000;
    }
    @computed get getExecutionOutputs() {
        return this.executionOutputs;
    }
    @computed get getDatasets() {
        return this.rootStore.dataStore.getDatasets;
    }
    @computed get getDatasetLength() {
        return this.rootStore.dataStore.getDataLength;
    }
    @computed get getModelTypeName() {
        return _.find(mc.modelTypes, {value: this.model_type}).name;
    }
    @computed get getModelTypeChoices() {
        return mc.modelTypes.map((item, i) => {
            return {value: item.value, text: item.name};
        });
    }
    @computed get getModels() {
        return this.rootStore.modelsStore.models;
    }

    @computed get hasAtLeastOneModelSelected() {
        return (
            _.chain(this.getModels)
                .values()
                .map(d => d.length)
                .sum() > 0
        );
    }

    @computed get hasAtLeastOneDatasetSelected() {
        return !_.isEmpty(this.getEnabledDatasets);
    }

    @computed get hasAtLeastOneOptionSelected() {
        return !_.isEmpty(this.getOptions);
    }

    @computed get isValid() {
        return (
            this.hasAtLeastOneModelSelected &&
            this.hasAtLeastOneDatasetSelected &&
            this.hasAtLeastOneOptionSelected
        );
    }
    @computed get hasOutputs() {
        return _.isArray(this.executionOutputs);
    }

    // *** TOAST ***
    @observable toastVisible = false;
    @observable toastHeader = "";
    @observable toastMessage = "";
    @action.bound downloadReport(url) {
        let apiUrl = (apiUrl = this.config[url]),
            params = {},
            pollInterval = this.pollInterval;
        if (this.canEdit) {
            params.editKey = this.config.editSettings.editKey;
        }
        if (url === "wordUrl") {
            _.extend(params, toJS(this.wordReportOptions));
        }
        const fetchReport = () => {
                fetch(apiUrl + "?" + new URLSearchParams(params).toString()).then(processResponse);
            },
            processResponse = response => {
                let contentType = response.headers.get("content-type");
                if (contentType.includes("application/json")) {
                    response.json().then(json => {
                        this.showToast(json.header, json.message);
                    });
                    setTimeout(fetchReport, pollInterval);
                } else {
                    const filename = response.headers
                        .get("content-disposition")
                        .match(/filename="(.*)"/)[1];
                    response.blob().then(blob => {
                        saveAs(blob, filename);
                        this.hideToast();
                    });
                }
            };
        fetchReport();
    }
    @action.bound showToast(header, message) {
        this.toastHeader = header;
        this.toastMessage = message;
        this.toastVisible = true;
    }
    @action.bound hideToast() {
        this.toastVisible = false;
        this.toastHeader = "";
        this.toastMessage = "";
    }
    // *** END TOAST ***

    // *** DEFAULT REPORT OPTIONS ***
    @observable wordReportOptions = {
        datasetFormatLong: true,
        allModels: false,
        bmdCdfTable: false,
    };
    @action.bound changeReportOptions(name, value) {
        this.wordReportOptions[name] = value;
    }
    @observable displayWordReportOptionModal = false;
    @action.bound showWordReportOptionModal() {
        this.displayWordReportOptionModal = true;
    }
    @action.bound closeWordReportOptionModal() {
        this.displayWordReportOptionModal = false;
    }
    @action.bound submitWordReportRequest() {
        this.closeWordReportOptionModal();
        this.downloadReport("wordUrl");
    }
    // *** END REPORT OPTIONS ***

    // *** STAR/UNSTAR ***
    @observable starred = false;
    @action.bound
    async starToggle() {
        const {csrfToken, starUrl} = this.config.editSettings;
        await fetch(starUrl, {
            method: "POST",
            mode: "cors",
            headers: getHeaders(csrfToken),
            body: JSON.stringify({
                editKey: this.config.editSettings.editKey,
            }),
        })
            .then(response => response.json())
            .then(data => {
                this.starred = data.starred;
            })
            .catch(error => {
                this.errorMessage = error;
                console.error("error", error);
            });
    }
    // *** STAR/UNSTAR ***

    // *** COLLECTIONS ***
    @observable collections = [];
    @computed
    get collectionDefaultValues() {
        return this.collections.map(d => d.id);
    }
    @action.bound
    async collectionsToggle(collections) {
        const {csrfToken, collectionUrl} = this.config.editSettings;
        await fetch(collectionUrl, {
            method: "POST",
            mode: "cors",
            headers: getHeaders(csrfToken),
            body: JSON.stringify({
                editKey: this.config.editSettings.editKey,
                collections,
            }),
        })
            .then(response => response.json())
            .then(data => {
                this.collections = data.collections;
            })
            .catch(error => {
                this.errorMessage = error;
                console.error("error", error);
            });
    }
    // *** COLLECTIONS ***
}

export default MainStore;
