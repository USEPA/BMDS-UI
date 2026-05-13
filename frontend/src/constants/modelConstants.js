import {
  MODEL_CONTINUOUS,
  MODEL_DICHOTOMOUS,
  MODEL_MULTI_TUMOR,
  MODEL_NESTED_DICHOTOMOUS,
} from "./mainConstants";

const distribution_map = { CV: 1, NCV: 2, LN: 3 };

const parseDisplayName = (displayName) => {
  const parts = displayName.split(" ");
  const suffix = parts[parts.length - 1];
  if (suffix in distribution_map) {
    return {
      baseModel: parts.slice(0, -1).join(" "),
      dist_type: distribution_map[suffix],
    };
  }
  return { baseModel: displayName, dist_type: undefined };
};

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
    [MODEL_CONTINUOUS]:
      // {
      //   mle: allContinuous,
      //   loud_bayesian: {
      //     bmds: ["Exponential-M3", "Exponential-M5", "Hill", "Power"],
      //     proast: [],
      //     efsa: [],
      //   },
      // },
      // {
      //   mle: allContinuous,
      //   loud_bayesian: {
      //     bmds: ["Exponential-M3", "Exponential-M5"],
      //     proast: ["Hill"],
      //     efsa: ["Power"],
      //   },
      // },
      {
        mle: allContinuous,
        loud_bayesian: {
          bmds: [
            "Exponential-M3 CV",
            "Exponential-M3 NCV",
            "Exponential-M3 LN",
            "Exponential-M5 CV",
            "Exponential-M5 LN",
          ],
          proast: ["Hill CV", "Hill NCV"],
          efsa: ["Power CV", "Power NCV"],
        },
      },
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
      // loud_bayesian: ["Exponential-M3", "Exponential-M5", "Hill", "Power"],
      loud_bayesian: [
        "Exponential-M3 CV",
        "Exponential-M3 NCV",
        "Exponential-M3 LN",
        "Exponential-M5 CV",
        "Exponential-M5 LN",
        "Hill CV",
        "Hill NCV",
        "Power CV",
        "Power NCV",
      ],
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

export {
  allModelOptions,
  distribution_map,
  hasDegrees,
  isLognormal,
  models,
  parseDisplayName,
  rowOrder,
};
