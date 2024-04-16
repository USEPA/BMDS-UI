import {observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";

import {Dtype} from "@/constants/dataConstants";
import {isLognormal} from "@/constants/modelConstants";
import {ff} from "@/utils/formatters";

@observer
class GoodnessFit extends Component {
    getDichotomousData(dataset, model) {
        const gof = model.results.gof;
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

    getContinuousNormalData(dataset, dtype, model) {
        const gof = model.results.gof,
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

    getContinuousLognormalData(dataset, dtype, model) {
        const gof = model.results.gof,
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

    render() {
        const {store} = this.props,
            settings = store.modalModel.settings,
            model = store.modalModel,
            dataset = store.isMultiTumor ? store.modalDataset : store.selectedDataset,
            {dtype} = dataset;
        let data;
        if (store.isMultiTumor || dtype == Dtype.DICHOTOMOUS) {
            data = this.getDichotomousData(dataset, model);
        } else if (isLognormal(settings.disttype)) {
            data = this.getContinuousLognormalData(dataset, dtype, model);
        } else {
            data = this.getContinuousNormalData(dataset, dtype, model);
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
