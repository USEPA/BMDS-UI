import {
    MODEL_CONTINUOUS,
    MODEL_DICHOTOMOUS,
    MODEL_MULTI_TUMOR,
    MODEL_NESTED_DICHOTOMOUS,
} from "./mainConstants";

const modelsList = {
        [MODEL_CONTINUOUS]: ["Exponential", "Hill", "Linear", "Polynomial", "Power"],
        [MODEL_DICHOTOMOUS]: [
            "Dichotomous-Hill",
            "Gamma",
            "Logistic",
            "LogLogistic",
            "LogProbit",
            "Multistage",
            "Probit",
            "Quantal Linear",
            "Weibull",
        ],
        [MODEL_NESTED_DICHOTOMOUS]: ["NestedLogistic", "NCTR"],
    },
    models = {
        [MODEL_CONTINUOUS]: {
            frequentist_restricted: ["Exponential", "Hill", "Polynomial", "Power"],
            frequentist_unrestricted: ["Linear"],
        },
        [MODEL_DICHOTOMOUS]: {
            frequentist_restricted: [
                "Dichotomous-Hill",
                "Gamma",
                "LogLogistic",
                "Multistage",
                "Weibull",
            ],
            frequentist_unrestricted: ["Logistic", "LogProbit", "Probit", "Quantal Linear"],
        },
        [MODEL_NESTED_DICHOTOMOUS]: {
            frequentist_restricted: ["Nested Logistic"],
            frequentist_unrestricted: [],
        },
        [MODEL_MULTI_TUMOR]: {
            frequentist_restricted: ["Multistage"],
            frequentist_unrestricted: [],
        },
    },
    allModelOptions = {
        [MODEL_CONTINUOUS]: {
            frequentist_restricted: ["Exponential", "Hill", "Polynomial", "Power"],
            frequentist_unrestricted: ["Hill", "Linear", "Polynomial", "Power"],
            bayesian: modelsList.C,
        },
        [MODEL_DICHOTOMOUS]: {
            frequentist_restricted: [
                "Dichotomous-Hill",
                "Gamma",
                "LogLogistic",
                "LogProbit",
                "Multistage",
                "Weibull",
            ],
            frequentist_unrestricted: modelsList.D,
            bayesian: modelsList.D,
        },
        [MODEL_NESTED_DICHOTOMOUS]: {
            frequentist_restricted: ["Nested Logistic"],
            frequentist_unrestricted: ["Nested Logistic"],
        },

        [MODEL_MULTI_TUMOR]: {
            frequentist_restricted: ["Multistage"],
            frequentist_unrestricted: [],
        },
    },
    isLognormal = function(disttype) {
        return disttype == 3;
    },
    hasDegrees = new Set(["Multistage", "Polynomial"]),
    getNameFromDegrees = function(model) {
        const degree = model.parameters.names.length - 1;
        return `Multistage ${degree}`;
    };

export {allModelOptions, getNameFromDegrees, hasDegrees, isLognormal, models, modelsList};
