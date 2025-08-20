import {
    MODEL_CONTINUOUS,
    MODEL_DICHOTOMOUS,
    MODEL_MULTI_TUMOR,
    MODEL_NESTED_DICHOTOMOUS,
} from "./mainConstants";

const allContinuous = ["Exponential", "Hill", "Linear", "Polynomial", "Power"];
const allDichotomous = [
    "Dichotomous-Hill",
    "Gamma",
    "Logistic",
    "LogLogistic",
    "LogProbit",
    "Multistage",
    "Probit",
    "Quantal Linear",
    "Weibull",
];
const allNestedDichotomous = ["Nested Logistic", "NCTR"];
const models = {
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
        frequentist_restricted: allNestedDichotomous,
        frequentist_unrestricted: [],
    },
    [MODEL_MULTI_TUMOR]: {
        frequentist_restricted: ["Multistage"],
        frequentist_unrestricted: [],
    },
};
const allModelOptions = {
    [MODEL_CONTINUOUS]: {
        frequentist_restricted: ["Exponential", "Hill", "Polynomial", "Power"],
        frequentist_unrestricted: ["Hill", "Linear", "Polynomial", "Power"],
        bayesian: allContinuous,
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
        frequentist_unrestricted: allDichotomous,
        bayesian: allDichotomous,
    },
    [MODEL_NESTED_DICHOTOMOUS]: {
        frequentist_restricted: allNestedDichotomous,
        frequentist_unrestricted: allNestedDichotomous,
    },
    [MODEL_MULTI_TUMOR]: {
        frequentist_restricted: ["Multistage"],
        frequentist_unrestricted: [],
    },
};
const isLognormal = disttype => disttype === 3;
const hasDegrees = new Set(["Multistage", "Polynomial"]);

export {allModelOptions, hasDegrees, isLognormal, models};
