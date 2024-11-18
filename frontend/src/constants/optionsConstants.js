import {
    MODEL_CONTINUOUS,
    MODEL_DICHOTOMOUS,
    MODEL_MULTI_TUMOR,
    MODEL_NESTED_DICHOTOMOUS,
} from "./mainConstants";

export const options = {
        [MODEL_CONTINUOUS]: {
            bmr_type: 2,
            bmr_value: 1,
            tail_probability: 0.01,
            confidence_level: 0.95,
            dist_type: 1,
        },
        [MODEL_DICHOTOMOUS]: {
            bmr_type: 1,
            bmr_value: 0.1,
            confidence_level: 0.95,
        },
        [MODEL_NESTED_DICHOTOMOUS]: {
            bmr_type: 1,
            bmr_value: 0.1,
            confidence_level: 0.95,
            litter_specific_covariate: 1,
            bootstrap_iterations: 1000,
            bootstrap_seed: 0,
            estimate_background: true,
        },
        [MODEL_MULTI_TUMOR]: {
            bmr_type: 1,
            bmr_value: 0.1,
            confidence_level: 0.95,
        },
    },
    dichotomousBmrOptions = [
        {value: 0, label: "Added Risk"},
        {value: 1, label: "Extra Risk"},
    ],
    continuousBmrOptions = [
        {value: 2, label: "Std. Dev."},
        {value: 3, label: "Rel. Dev."},
        {value: 1, label: "Abs. Dev"},
        {value: 4, label: "Point"},
        {value: 6, label: "Hybrid-Extra Risk"},
        {value: 7, label: "Hybrid-Added Risk"},
    ],
    isHybridBmr = function(val) {
        return val === 6 || val === 7;
    },
    distTypeOptions = [
        {value: 1, label: "Normal + Constant"},
        {value: 2, label: "Normal + Non-constant"},
        {value: 3, label: "Lognormal"},
    ],
    litterSpecificCovariateOptions = [
        {value: 0, label: "Not Used"},
        {value: 1, label: "Overall Mean"},
        {value: 2, label: "Control Group Mean"},
    ],
    intralitterCorrelation = [
        {value: 0, label: "Assume Zero"},
        {value: 1, label: "Estimate"},
    ],
    bmrForBmrTypeContinuous = {
        2: 1,
        3: 0.1,
        1: 1,
        4: 1,
        6: 0.1,
        7: 0.1,
    },
    BMR_TYPE = "bmr_type",
    BMR_VALUE = "bmr_value";
