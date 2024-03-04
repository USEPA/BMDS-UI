import {observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";

import {Dtype} from "@/constants/dataConstants";
import {isLognormal} from "@/constants/modelConstants";
import {ff} from "@/utils/formatters";

@observer
class GoodnessFit extends Component {
    getDichotomousData() {
        const {store} = this.props,
            gof = store.modalModel.results.gof,
            dataset = store.selectedDataset;
        return {
            headers: [
                "Dose",
                "N",
                "Observed",
                "Expected",
                "Estimated Probability",
                "Scaled Residual",
            ],
            colwidths: [17, 16, 16, 17, 17, 17],
            data: dataset.doses.map((dose, i) => {
                return [
                    dose,
                    dataset.ns[i],
                    dataset.incidences[i],
                    ff(gof.expected[i]),
                    ff(gof.expected[i] / dataset.ns[i]),
                    ff(gof.residual[i]),
                ];
            }),
        };
    }

    getContinuousNormalData(dtype) {
        const {store} = this.props,
            gof = store.modalModel.results.gof,
            dataset = store.selectedDataset,
            useFF = dtype === Dtype.CONTINUOUS_INDIVIDUAL;
        return {
            headers: [
                "Dose",
                "N",
                "Sample Mean",
                "Model Fitted Mean",
                "Sample SD",
                "Model Fitted SD",
                "Scaled Residual",
            ],
            colwidths: [1, 1, 1, 1, 1, 1, 1],
            data: dataset.doses.map((dose, i) => {
                return [
                    dose,
                    dataset.ns[i],
                    useFF ? ff(gof.obs_mean[i]) : gof.obs_mean[i],
                    ff(gof.est_mean[i]),
                    useFF ? ff(gof.obs_sd[i]) : gof.obs_sd[i],
                    ff(gof.est_sd[i]),
                    ff(gof.residual[i]),
                ];
            }),
        };
    }

    getContinuousLognormalData(dtype) {
        const {store} = this.props,
            gof = store.modalModel.results.gof,
            dataset = store.selectedDataset,
            useFF = dtype === Dtype.CONTINUOUS_INDIVIDUAL;
        return {
            headers: [
                "Dose",
                "N",
                "Sample Mean",
                "Approximate Sample Median",
                "Model Fitted Median",
                "Sample SD",
                "Approximate Sample GSD",
                "Model Fitted GSD",
                "Scaled Residual",
            ],
            colwidths: [10, 10, 10, 12, 12, 12, 10, 12, 12],
            data: dataset.doses.map((dose, i) => {
                return [
                    dose,
                    dataset.ns[i],
                    useFF ? ff(gof.obs_mean[i]) : gof.obs_mean[i],
                    ff(gof.calc_mean[i]),
                    ff(gof.est_mean[i]),
                    useFF ? ff(gof.obs_sd[i]) : gof.obs_sd[i],
                    ff(gof.calc_mean[i]),
                    ff(gof.est_sd[i]),
                    ff(gof.residual[i]),
                ];
            }),
        };
    }

    getMultitumorData(dtype, settings) {
        /* eslint-disable */
        const hdr_c_normal = [
            "Dose", "Size", "Observed Mean", "Calculated Mean", "Estimated Mean",
            "Observed SD", "Calculated SD", "Estimated SD", "Scaled Residual",
        ],
        hdr_c_lognormal = [
            "Dose", "Size", "Observed Mean", "Calculated Median", "Estimated Median",
            "Observed SD", "Calculated GSD", "Estimated GSD", "Scaled Residual",
        ],
        hdr_d = [ "Dose", "Size", "Observed", "Expected", "Estimated Probability", "Scaled Residual"],
        /* eslint-enable */
            {store} = this.props,
            gof = store.modalModel.gof,
            dataset = store.modalDataset ? store.modalDataset : store.selectedDataset;

        if (dtype == Dtype.CONTINUOUS || dtype == Dtype.CONTINUOUS_INDIVIDUAL) {
            const headers = isLognormal(settings.disttype) ? hdr_c_lognormal : hdr_c_normal;

            return {
                headers,
                colwidths: [10, 10, 10, 12, 12, 12, 10, 12, 12],
                data: dataset.doses.map((dose, i) => {
                    return [
                        dose,
                        gof.size[i],
                        dtype === Dtype.CONTINUOUS_INDIVIDUAL
                            ? ff(gof.obs_mean[i])
                            : gof.obs_mean[i],
                        ff(gof.calc_mean[i]),
                        ff(gof.est_mean[i]),
                        dtype === Dtype.CONTINUOUS_INDIVIDUAL ? ff(gof.obs_sd[i]) : gof.obs_sd[i],
                        ff(gof.calc_sd[i]),
                        ff(gof.est_sd[i]),
                        ff(gof.residual[i]),
                    ];
                }),
            };
        }
        if (dtype == Dtype.DICHOTOMOUS) {
            return {
                headers: hdr_d,
                colwidths: [17, 16, 16, 17, 17, 17],
                data: dataset.doses.map((dose, i) => {
                    return [
                        dose,
                        dataset.ns[i],
                        dataset.incidences[i],
                        ff(gof.expected[i]),
                        ff(gof.expected[i] / dataset.ns[i]),
                        ff(gof.residual[i]),
                    ];
                }),
            };
        }
    }

    render() {
        const {store} = this.props,
            settings = store.modalModel.settings,
            // if modalDataset, means MT then do other table?
            // is there a better way to detect MT?
            dataset = store.modalDataset ? store.modalDataset : store.selectedDataset,
            {dtype} = dataset;
        let data;
        if (store.modalDataset) {
            data = this.getMultitumorData(dtype, settings);
        } else {
            if (dtype == Dtype.DICHOTOMOUS) {
                data = this.getDichotomousData();
            } else {
                if (isLognormal(settings.disttype)) {
                    data = this.getContinuousLognormalData(dtype);
                } else {
                    data = this.getContinuousNormalData(dtype);
                }
            }
        }

        return (
            <table className="table table-sm table-bordered text-right">
                <colgroup>
                    {data.colwidths.map((d, i) => (
                        <col key={i} width={`${d}%`} />
                    ))}
                </colgroup>
                <thead>
                    <tr className="bg-custom text-left">
                        <th colSpan={data.headers.length}>Goodness of Fit</th>
                    </tr>
                    <tr>
                        {data.headers.map((d, i) => (
                            <th key={i}>{d}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.data.map((row, i) => {
                        return (
                            <tr key={i}>
                                {row.map((cell, j) => (
                                    <td key={j}>{cell}</td>
                                ))}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        );
    }
}
GoodnessFit.propTypes = {
    store: PropTypes.object,
};
export default GoodnessFit;
