import _ from "lodash";

const BMDS_BLANK_VALUE = -9999;

export const ff = value => {
        // ff = float format
        if (value === 0) {
            return value.toString();
        }
        if (value === BMDS_BLANK_VALUE || !_.isFinite(value)) {
            return "-";
        }
        if (Math.abs(value) > 0.001 && Math.abs(value) < 1e5) {
            // local print "0" for anything smaller than this
            return value.toLocaleString();
        }
        // too many 0; use exponential notation
        return value.toExponential(2);
    },
    parameterFormatter = value => {
        if (value === 0) {
            return value.toString();
        }
        if (value === BMDS_BLANK_VALUE || !_.isFinite(value)) {
            return "-";
        }
        if (Math.abs(value) >= 1000 || Math.abs(value) <= 0.001) {
            return value.toExponential(3);
        }
        return value.toPrecision(4);
    },
    fractionalFormatter = value => {
        // Expected values between 0 and 1
        if (value === BMDS_BLANK_VALUE || !_.isFinite(value) || value < 0) {
            return "-";
        }
        if (value === 0) {
            return value.toString();
        }
        if (value < 0.0001) {
            return "< 0.0001";
        }
        return value.toPrecision(3);
    };
