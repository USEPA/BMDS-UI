import {toJS} from "mobx";
import {inject, observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";

import {
    MODEL_CONTINUOUS,
    MODEL_DICHOTOMOUS,
    MODEL_MULTI_TUMOR,
    MODEL_NESTED_DICHOTOMOUS,
} from "@/constants/mainConstants";

import Button from "../../common/Button";
import HelpTextPopover from "../../common/HelpTextPopover";
import OptionsForm from "./OptionsForm";
import OptionsReadOnly from "./OptionsReadOnly";

@inject("optionsStore")
@observer
class OptionsFormList extends Component {
    render() {
        const {optionsStore} = this.props,
            modelType = optionsStore.getModelType,
            optionsList = toJS(optionsStore.optionsList),
            distTypeHelpText =
                "If lognormal is selected, only the Exponential and Hill models can be executed. Other models will be removed during the execution process and will not be shown in the outputs.",
            tailProbabilityHelpText = "Only used for Hybrid models.";
        return (
            <div>
                <div className="panel panel-default">
                    <form className="form-horizontal">
                        <table className="table table-sm table-fixed">
                            <thead className="bg-custom">
                                <tr>
                                    <th>Option Set #</th>
                                    {modelType === MODEL_CONTINUOUS ? (
                                        <>
                                            <th>BMR Type</th>
                                            <th>BMRF</th>
                                            <th>
                                                Tail Probability
                                                <HelpTextPopover
                                                    content={tailProbabilityHelpText}
                                                />
                                            </th>
                                            <th>Confidence Level (one sided)</th>
                                            <th>
                                                Distribution +<br />
                                                Variance&nbsp;
                                                <HelpTextPopover content={distTypeHelpText} />
                                            </th>
                                        </>
                                    ) : null}
                                    {modelType === MODEL_DICHOTOMOUS ||
                                    modelType === MODEL_MULTI_TUMOR ? (
                                        <>
                                            <th>Risk Type</th>
                                            <th>BMR</th>
                                            <th>Confidence Level (one sided)</th>
                                        </>
                                    ) : null}
                                    {modelType === MODEL_NESTED_DICHOTOMOUS ? (
                                        <>
                                            <th>Risk Type</th>
                                            <th>BMR</th>
                                            <th>Confidence Level (one sided)</th>
                                            <th>
                                                Litter Specific
                                                <br />
                                                Covariate
                                            </th>
                                            <th>Estimate Background</th>
                                            <th>
                                                Bootstrap
                                                <br />
                                                Iterations
                                            </th>
                                            <th>Bootstrap Seed</th>
                                        </>
                                    ) : null}
                                    {optionsStore.canEdit ? (
                                        <th style={{width: "55px"}}>
                                            <Button
                                                title="Add option set."
                                                className="btn btn-primary"
                                                disabled={!optionsStore.canAddNewOption}
                                                onClick={optionsStore.addOptions}
                                                icon="plus-circle"
                                            />
                                        </th>
                                    ) : null}
                                </tr>
                            </thead>
                            {optionsStore.canEdit ? (
                                <tbody>
                                    {optionsList.map((options, id) => (
                                        <OptionsForm
                                            key={id}
                                            idx={id}
                                            options={options}
                                            modelType={modelType}
                                            deleteOptions={optionsStore.deleteOptions}
                                            saveOptions={optionsStore.saveOptions}
                                        />
                                    ))}
                                </tbody>
                            ) : (
                                <tbody>
                                    {optionsList.map((options, id) => (
                                        <OptionsReadOnly
                                            key={id}
                                            idx={id}
                                            options={options}
                                            modelType={modelType}
                                        />
                                    ))}
                                </tbody>
                            )}
                        </table>
                        {optionsStore.canAddNewOption ? null : (
                            <p className="text-danger">
                                Can have a maximum of {optionsStore.maxItems} option sets per
                                analysis.
                            </p>
                        )}
                    </form>
                </div>
            </div>
        );
    }
}

OptionsFormList.propTypes = {
    optionsStore: PropTypes.object,
};

export default OptionsFormList;
