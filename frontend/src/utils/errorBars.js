import _ from "lodash";

export const inv_tdist_05 = function(df) {
        // Calculates the inverse t-distribution using a piecewise linear form for
        // the degrees of freedom specified. Assumes a two-tailed distribution with
        // an alpha of 0.05. Based on curve-fitting using Excel's T.INV.2T function
        // with a maximum absolute error of 0.00924 and percent error of 0.33%.
        //
        // Roughly equivalent to scipy.stats.t.ppf(0.975, df)
        var b;
        if (df < 1) {
            return NaN;
        } else if (df == 1) {
            return 12.7062047361747;
        } else if (df < 12) {
            b = [
                7.9703237683e-5,
                -3.5145890027e-3,
                0.063259191874,
                -0.5963723075,
                3.129413441,
                -8.8538894383,
                13.358101926,
            ];
        } else if (df < 62) {
            b = [
                1.1184055716e-10,
                -2.7885328039e-8,
                2.8618499662e-6,
                -1.5585120701e-4,
                4.8300645273e-3,
                -0.084316656676,
                2.7109288893,
            ];
        } else {
            b = [
                5.1474329765e-16,
                -7.262226388e-13,
                4.2142967681e-10,
                -1.2973354626e-7,
                2.275308052e-5,
                -2.2594979441e-3,
                2.0766977669,
            ];
            if (df > 350) {
                console.warn("Extrapolating beyond inv_tdist_05 regression range (N>350).");
                return Number.NaN;
            }
        }
        return (
            b[0] * Math.pow(df, 6) +
            b[1] * Math.pow(df, 5) +
            b[2] * Math.pow(df, 4) +
            b[3] * Math.pow(df, 3) +
            b[4] * Math.pow(df, 2) +
            b[5] * Math.pow(df, 1) +
            b[6]
        );
    },
    continuousErrorBars = function(dataset) {
        // Calculate 95% confidence intervals
        let uppers = [],
            lowers = [],
            bounds = [];
        dataset.doses.map((dose, idx) => {
            let mean = dataset.means[idx],
                n = dataset.ns[idx],
                stdev = dataset.stdevs[idx];

            if (_.isFinite(mean) && _.isFinite(n) && _.isFinite(stdev) && n > 0) {
                const se = stdev / Math.sqrt(n),
                    z = inv_tdist_05(n - 1) || 2.04,
                    change = se * z;
                uppers.push(change);
                lowers.push(change);
                bounds.push([mean - change, mean + change]);
            } else {
                uppers.push(undefined);
                lowers.push(undefined);
                bounds.push([undefined, undefined]);
            }
        });

        return {
            type: "data",
            symmetric: false,
            array: uppers,
            arrayminus: lowers,
            bounds,
        };
    },
    dichotomousErrorBars = function(dataset) {
        /*
        Procedure adds confidence intervals to dichotomous datasets.
        Add confidence intervals to dichotomous datasets. (pg 80)
        https://www.epa.gov/sites/production/files/2020-09/documents/bmds_3.2_user_guide.pdf
        */
        let uppers = [],
            lowers = [],
            bounds = [];
        dataset.doses.map((dose, idx) => {
            let n = dataset.ns[idx],
                incidence = dataset.incidences[idx];

            if (_.isNumber(n) && _.isNumber(incidence) && n > 0 && n >= incidence) {
                var p = incidence / n,
                    q = 1 - p,
                    z = 1.959963984540054,
                    z2 = z * z,
                    tmp1 = 2 * n * p + z2,
                    tmp2 = 2 + 1 / n,
                    tmp3 = 2 * (n + z2),
                    lower = (tmp1 - 1 - z * Math.sqrt(z2 - tmp2 + 4 * p * (n * q + 1))) / tmp3,
                    upper = (tmp1 + 1 + z * Math.sqrt(z2 + tmp2 + 4 * p * (n * q - 1))) / tmp3;
                uppers.push(upper - p);
                lowers.push(p - lower);
                bounds.push([lower, upper]);
            } else {
                uppers.push(undefined);
                lowers.push(undefined);
                bounds.push([undefined, undefined]);
            }
        });

        return {
            type: "data",
            symmetric: false,
            array: uppers,
            arrayminus: lowers,
            bounds,
        };
    };
