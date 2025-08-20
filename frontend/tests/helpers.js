import assert from "assert";
import _ from "lodash";

const isClose = function(actual, expected, atol) {
        return assert.ok(Math.abs(actual - expected) < atol, `|${actual} - ${expected}| > ${atol}`);
    },
    allClose = function(actual, expected, atol) {
        _.zip(actual, expected).map(d => {
            isClose(d[0], d[1], atol);
        });
    },
    allEqual = function(actual, expected) {
        _.zip(actual, expected).map(d => d[0] === d[1]);
    };

assert.isClose = isClose;
assert.allClose = allClose;
assert.allEqual = allEqual;

export default assert;
