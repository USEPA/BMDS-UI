import {
  MODEL_CONTINUOUS,
  MODEL_DICHOTOMOUS,
  MODEL_MULTI_TUMOR,
  MODEL_NESTED_DICHOTOMOUS,
} from "./mainConstants";

const allContinuous = [
    "Exponential-M3",
    "Exponential-M5",
    "Hill",
    "Linear",
    "Polynomial",
    "Power",
  ],
  allDichotomous = [
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
  allNestedDichotomous = ["Nested Logistic", "NCTR"],
  rowOrder = {
    [MODEL_CONTINUOUS]: allContinuous,
    [MODEL_DICHOTOMOUS]: allDichotomous,
    [MODEL_NESTED_DICHOTOMOUS]: allNestedDichotomous,
  },
  models = {
    [MODEL_CONTINUOUS]: {
      frequentist_restricted: [
        "Exponential-M3",
        "Exponential-M5",
        "Hill",
        "Polynomial",
        "Power",
      ],
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
      frequentist_unrestricted: [
        "Logistic",
        "LogProbit",
        "Probit",
        "Quantal Linear",
      ],
    },
    [MODEL_NESTED_DICHOTOMOUS]: {
      frequentist_restricted: allNestedDichotomous,
      frequentist_unrestricted: [],
    },
    [MODEL_MULTI_TUMOR]: {
      frequentist_restricted: ["Multistage"],
      frequentist_unrestricted: [],
    },
  },
  allModelOptions = {
    [MODEL_CONTINUOUS]: {
      frequentist_restricted: [
        "Exponential-M3",
        "Exponential-M5",
        "Hill",
        "Polynomial",
        "Power",
      ],
      frequentist_unrestricted: ["Hill", "Linear", "Polynomial", "Power"],
      loud_bayesian: ["Exponential-M3", "Exponential-M5", "Hill", "Power"],
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
      toxicr_bayesian: allDichotomous,
      loud_bayesian: allDichotomous,
    },
    [MODEL_NESTED_DICHOTOMOUS]: {
      frequentist_restricted: allNestedDichotomous,
      frequentist_unrestricted: allNestedDichotomous,
    },
    [MODEL_MULTI_TUMOR]: {
      frequentist_restricted: ["Multistage"],
      frequentist_unrestricted: [],
    },
  },
  isLognormal = function (disttype) {
    return disttype == 3;
  },
  hasDegrees = new Set(["Multistage", "Polynomial"]);

export { allModelOptions, hasDegrees, isLognormal, models, rowOrder };
