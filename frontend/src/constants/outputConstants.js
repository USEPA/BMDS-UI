import {Dtype} from "./dataConstants";

export const getPValue = (dataType, results) => {
        if (dataType === Dtype.DICHOTOMOUS) {
            return results.gof.p_value;
        }
        return results.tests.p_values[3];
    },
    isFrequentist = priorClass => priorClass < 2,
    priorClass = {
        frequentist_unrestricted: 0,
        frequentist_restricted: 1,
        bayesian: 2,
        custom: 3,
    },
    modelClasses = {
        frequentist: 0,
        bayesian: 1,
    },
    maIndex = 999,
    priorClassLabels = [
        {value: 0, label: "Frequentist Unrestricted"},
        {value: 1, label: "Frequentist Restricted"},
        {value: 2, label: "Bayesian"},
    ],
    priorTypeLabels = [
        {value: 0, label: "Uniform"},
        {value: 1, label: "Normal"},
        {value: 2, label: "Lognormal"},
    ];
