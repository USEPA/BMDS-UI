import {observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";

import Table from "@/components/common/Table";
import {Dtype} from "@/constants/dataConstants";
import {isLognormal} from "@/constants/modelConstants";
import {ff} from "@/utils/formatters";

const getDichotomousData = function(dataset, model) {
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
            colWidths: [17, 16, 16, 17, 17, 17],
            rows: dataset.doses.map((dose, i) => {
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
    },
    getContinuousNormalData = function(dataset, dtype, model) {
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
            colWidths: [1, 1, 1, 1, 1, 1, 1],
            rows: gof.dose.map((item, i) => {
                return [
                    item,
                    gof.size[i],
                    useFF ? ff(gof.obs_mean[i]) : gof.obs_mean[i],
                    ff(gof.est_mean[i]),
                    useFF ? ff(gof.obs_sd[i]) : gof.obs_sd[i],
                    ff(gof.est_sd[i]),
                    ff(gof.residual[i]),
                ];
            }),
        };
    },
    getContinuousLognormalData = function(dataset, dtype, model) {
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
            colWidths: [10, 10, 10, 12, 12, 12, 10, 12, 12],
            rows: dataset.doses.map((dose, i) => {
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
    };

@observer
class GoodnessFit extends Component {
    render() {
        const {store} = this.props,
            settings = store.modalModel.settings,
            model = store.modalModel,
            dataset = store.isMultiTumor ? store.modalDataset : store.selectedDataset,
            {dtype} = dataset;
        let data;
        if (store.isMultiTumor || dtype == Dtype.DICHOTOMOUS) {
            data = getDichotomousData(dataset, model);
        } else if (isLognormal(settings.disttype)) {
            data = getContinuousLognormalData(dataset, dtype, model);
        } else {
            data = getContinuousNormalData(dataset, dtype, model);
        }
        data.tblClasses = "table table-sm text-right";
        data.subheader = "Goodness of Fit";

        return <Table data={data} />;
    }
}
GoodnessFit.propTypes = {
    store: PropTypes.object,
};
export default GoodnessFit;
