import {continuousErrorBars, dichotomousErrorBars, inv_tdist_05} from "../../src/utils/errorBars";
import assert from "../helpers";

describe("utils/errorBars", () => {
    describe("inv_tdist_05", () => {
        it("handles out of bounds", () => {
            assert.ok(Number.isNaN(inv_tdist_05(0)));
            assert.ok(Number.isNaN(inv_tdist_05(351)));
        });
        it("approximated values are close to expected", () => {
            assert.isClose(inv_tdist_05(1), 12.706, 1e-2);
            assert.isClose(inv_tdist_05(2), 4.302, 1e-2);
            assert.isClose(inv_tdist_05(10), 2.228, 1e-2);
            assert.isClose(inv_tdist_05(30), 2.042, 1e-2);
            assert.isClose(inv_tdist_05(250), 1.969, 1e-2);
            assert.isClose(inv_tdist_05(350), 1.969, 1e-2);
        });
    });

    describe("continuousErrorBars", () => {
        it("works with invalid data", () => {
            const dataset = {
                doses: [1, 2, 3, 4],
                ns: [undefined, 0, 30, 30],
                means: [10, 10, undefined, 10],
                stdevs: [1, 1, 1, undefined],
            };
            const resp = continuousErrorBars(dataset);

            resp.array.forEach(d => assert.ok(d === undefined));
            resp.arrayminus.forEach(d => assert.ok(d === undefined));
        });
        it("works with valid data", () => {
            const dataset = {
                doses: [0, 1],
                ns: [30, 10],
                stdevs: [1, 1],
                means: [10, 10],
            };
            const resp = continuousErrorBars(dataset);

            assert.allClose(resp.arrayminus, [0.38, 0.72], 0.01);
            assert.allClose(resp.array, [0.37, 0.72], 0.01);
        });
    });

    describe("dichotomousErrorBars", () => {
        it("works with invalid data", () => {
            const dataset = {
                doses: [1, 2, 3],
                ns: [undefined, 0, 30],
                incidences: [10, 10, undefined],
            };
            const resp = dichotomousErrorBars(dataset);

            resp.array.forEach(d => assert.ok(d === undefined));
            resp.arrayminus.forEach(d => assert.ok(d === undefined));
        });
        it("works with valid data", () => {
            const dataset = {
                doses: [1, 2, 3, 4],
                ns: [10, 10, 100, 1000],
                incidences: [0, 3, 50, 100],
            };
            const resp = dichotomousErrorBars(dataset);

            assert.allClose(resp.arrayminus, [-0.009, 0.219, 0.101, 0.018], 0.01);
            assert.allClose(resp.array, [0.347, 0.348, 0.101, 0.021], 0.01);
        });
    });
});
