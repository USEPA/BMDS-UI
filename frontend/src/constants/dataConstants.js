import _ from "lodash";

import * as mc from "./mainConstants";

const Dtype = {
    DICHOTOMOUS: "D",
    CONTINUOUS: "C",
    CONTINUOUS_INDIVIDUAL: "CI",
    NESTED_DICHOTOMOUS: "ND",
    MULTI_TUMOR: "MT",
};

export {Dtype};
export const DATA_CONTINUOUS_SUMMARY = "CS",
    DATA_CONTINUOUS_INDIVIDUAL = "I",
    DATA_DICHOTOMOUS = "DM",
    DATA_NESTED_DICHOTOMOUS = "ND",
    DATA_MULTI_TUMOR = "MT",
    datasetTypesByModelType = modelType => {
        switch (modelType) {
            case mc.MODEL_DICHOTOMOUS:
                return [{value: DATA_DICHOTOMOUS, name: "Dichotomous"}];
            case mc.MODEL_CONTINUOUS:
                return [
                    {value: DATA_CONTINUOUS_SUMMARY, name: "Summarized"},
                    {value: DATA_CONTINUOUS_INDIVIDUAL, name: "Individual"},
                ];
            case mc.MODEL_NESTED_DICHOTOMOUS:
                return [{value: DATA_NESTED_DICHOTOMOUS, name: "Nested Dichotomous"}];
            case mc.MODEL_MULTI_TUMOR:
                return [{value: DATA_DICHOTOMOUS, name: "Dichotomous"}];
            default:
                throw `Unknown modelType: ${modelType}`;
        }
    },
    columns = {
        [Dtype.CONTINUOUS]: ["doses", "ns", "means", "stdevs"],
        [Dtype.CONTINUOUS_INDIVIDUAL]: ["doses", "responses"],
        [Dtype.DICHOTOMOUS]: ["doses", "ns", "incidences"],
        [Dtype.NESTED_DICHOTOMOUS]: ["doses", "litter_ns", "incidences", "litter_covariates"],
    },
    columnNames = {
        [DATA_CONTINUOUS_SUMMARY]: {
            doses: "Dose",
            ns: "N",
            means: "Mean",
            stdevs: "Std. Dev.",
        },
        [DATA_CONTINUOUS_INDIVIDUAL]: {
            doses: "Dose",
            responses: "Response",
        },
        [DATA_DICHOTOMOUS]: {
            doses: "Dose",
            ns: "N",
            incidences: "Incidence",
        },
        [DATA_NESTED_DICHOTOMOUS]: {
            doses: "Dose",
            litter_ns: "Litter Size",
            incidences: "Incidence",
            litter_covariates: "Litter Specific Covariate",
        },
    },
    columnHeaders = {
        doses: "Dose",
        ns: "N",
        means: "Mean",
        stdevs: "Std. Dev.",
        responses: "Response",
        incidences: "Incidence",
        litter_ns: "Litter Size",
        litter_covariates: "Litter Specific Covariate",
    },
    getDefaultDataset = dtype => {
        switch (dtype) {
            case DATA_CONTINUOUS_SUMMARY:
                return {
                    dtype: Dtype.CONTINUOUS,
                    metadata: {
                        id: null,
                        name: "",
                        dose_units: "",
                        response_units: "",
                        dose_name: "Dose",
                        response_name: "Response",
                    },
                    doses: ["", "", "", "", ""],
                    ns: ["", "", "", "", ""],
                    means: ["", "", "", "", ""],
                    stdevs: ["", "", "", "", ""],
                };
            case DATA_CONTINUOUS_INDIVIDUAL:
                return {
                    dtype: Dtype.CONTINUOUS_INDIVIDUAL,
                    metadata: {
                        id: null,
                        name: "",
                        dose_units: "",
                        response_units: "",
                        dose_name: "Dose",
                        response_name: "Response",
                    },
                    doses: ["", "", "", "", ""],
                    responses: ["", "", "", "", ""],
                };
            case DATA_DICHOTOMOUS:
                return {
                    dtype: Dtype.DICHOTOMOUS,
                    metadata: {
                        id: null,
                        name: "",
                        dose_units: "",
                        response_units: "",
                        dose_name: "Dose",
                        response_name: "Incidence",
                    },
                    doses: ["", "", "", "", ""],
                    ns: ["", "", "", "", ""],
                    incidences: ["", "", "", "", ""],
                };
            case DATA_NESTED_DICHOTOMOUS:
                return {
                    dtype: Dtype.NESTED_DICHOTOMOUS,
                    metadata: {
                        id: null,
                        name: "",
                        dose_units: "",
                        response_units: "",
                        dose_name: "Dose",
                        response_name: "Incidence",
                    },
                    doses: ["", "", "", "", ""],
                    litter_ns: ["", "", "", "", ""],
                    incidences: ["", "", "", "", ""],
                    litter_covariates: ["", "", "", "", ""],
                };
            default:
                throw `Unknown dataset type ${dtype}`;
        }
    },
    getExampleData = dtype => {
        /* eslint-disable */
        switch (dtype) {
            case DATA_CONTINUOUS_SUMMARY:
                return {
                    doses: [0, 50, 100, 200, 400],
                    ns: [20, 20, 20, 20, 20],
                    means: [5.26, 5.76, 6.13, 8.24, 9.23],
                    stdevs: [2.23, 1.47, 2.47, 2.24, 1.56],
                };
            case DATA_CONTINUOUS_INDIVIDUAL:
                return {
                    doses: [
                        0, 0, 0, 0, 0, 0, 0, 0, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 1, 1, 1, 1, 1, 1, 10,
                        10, 10, 10, 10, 10, 100, 100, 100, 100, 100, 100, 300, 300, 300, 300, 300,
                        300, 500, 500, 500, 500, 500, 500,
                    ],
                    responses: [
                        8.1079, 9.3063, 9.7431, 9.7814, 10.0517, 10.6132, 10.7509, 11.0567, 9.1556,
                        9.6821, 9.8256, 10.2095, 10.2222, 12.0382, 9.5661, 9.7059, 9.9905, 10.2716,
                        10.471, 11.0602, 8.8514, 10.0107, 10.0854, 10.5683, 11.1394, 11.4875,
                        9.5427, 9.7211, 9.8267, 10.0231, 10.1833, 10.8685, 11.368, 13.5176, 12.3168,
                        14.002, 17.1186, 13.6368, 19.9572, 20.1347, 16.7743, 20.0571, 15.1564,
                        15.0368,
                    ],
                };
            case DATA_DICHOTOMOUS:
                return {
                    doses: [0, 50, 100, 200, 400],
                    ns: [20, 20, 20, 20, 20],
                    incidences: [0, 1, 2, 10, 19],
                };
            case DATA_NESTED_DICHOTOMOUS:
                return {
                    doses: [
                        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 50,
                        50, 50, 50, 50, 50, 50, 50, 50, 50, 100, 100, 100, 100, 100, 100, 100, 100,
                        100,
                    ],
                    litter_ns: [
                        16, 9, 15, 14, 13, 9, 10, 14, 10, 11, 14, 9, 14, 9, 13, 12, 10, 10, 11, 14,
                        11, 11, 14, 11, 10, 11, 10, 15, 7, 14, 11, 14, 12, 13, 12, 14, 11, 8, 10,
                    ],
                    incidences: [
                        1, 1, 2, 3, 3, 0, 2, 2, 1, 2, 4, 5, 6, 2, 6, 3, 1, 2, 4, 3, 4, 5, 5, 4, 5,
                        4, 5, 6, 2, 4, 6, 6, 8, 7, 8, 6, 6, 5, 4,
                    ],
                    litter_covariates: [
                        16, 9, 15, 14, 13, 9, 10, 14, 10, 11, 14, 9, 14, 9, 13, 12, 10, 10, 11, 14,
                        11, 11, 14, 11, 10, 11, 10, 15, 7, 14, 11, 14, 12, 13, 12, 14, 11, 8, 10,
                    ],
                };
            default:
                throw `Unknown dataset type ${dtype}`;
        }
        /* eslint-enable */
    },
    datasetOptions = {
        [mc.MODEL_CONTINUOUS]: {
            enabled: true,
            degree: 0,
            adverse_direction: -1,
        },
        [mc.MODEL_DICHOTOMOUS]: {
            enabled: true,
            degree: 0,
        },
        [mc.MODEL_NESTED_DICHOTOMOUS]: {
            enabled: true,
        },
        [mc.MODEL_MULTI_TUMOR]: {
            enabled: true,
            degree: 0,
        },
    },
    adverseDirectionOptions = [
        {value: -1, label: "Automatic"},
        {value: 1, label: "Up"},
        {value: 0, label: "Down"},
    ],
    allDegreeOptions = [
        {value: 0, label: "N-1"},
        {value: 1, label: "1"},
        {value: 2, label: "2"},
        {value: 3, label: "3"},
        {value: 4, label: "4"},
        {value: 5, label: "5"},
        {value: 6, label: "6"},
        {value: 7, label: "7"},
        {value: 8, label: "8"},
    ],
    getNumDoseGroups = dataset => _.uniq(dataset.doses).length,
    getDefaultDegree = (dtype, dataset) => {
        if (dtype === Dtype.MULTI_TUMOR) {
            return 0; // auto
        }
        const n = getNumDoseGroups(dataset) - 1;
        return _.clamp(n, 1, 3);
    },
    getDegreeOptions = (dtype, dataset) => {
        const maxDegree = Math.max(Math.min(8, getNumDoseGroups(dataset) - 1), 1);
        const options = _.cloneDeep(allDegreeOptions).filter(d => d.value <= maxDegree);
        if (dtype === Dtype.MULTI_TUMOR) {
            options[0].label = "auto";
        }
        return options;
    };
