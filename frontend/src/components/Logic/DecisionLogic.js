import {inject, observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";

import {checkOrEmpty} from "@/common";

import Button from "../common/Button";
import CheckboxInput from "../common/CheckboxInput";
import FloatInput from "../common/FloatInput";

@inject("logicStore")
@observer
class DecisionLogic extends Component {
    render() {
        const {logicStore} = this.props,
            {canEdit, resetLogic, updateLogic, logic} = logicStore,
            renderBooleanRow = (label, field) => {
                return (
                    <tr>
                        <td>{label}</td>
                        <td className="text-center" style={{minWidth: 50}}>
                            {canEdit ? (
                                <CheckboxInput
                                    onChange={value => updateLogic(field, value)}
                                    checked={logic[field]}
                                />
                            ) : (
                                checkOrEmpty(logic[field])
                            )}
                        </td>
                    </tr>
                );
            };

        return (
            <div>
                {canEdit ? (
                    <div className="row">
                        <div className="col col-md-6">
                            <Button
                                className="btn btn-warning btn-sm"
                                onClick={resetLogic}
                                text="Reset to Default Logic"
                            />
                        </div>
                    </div>
                ) : null}
                <div className="row mt-2">
                    <div className="col col-lg-6">
                        <table id="decision-logic" className="table table-sm">
                            <thead>
                                <tr className="bg-custom">
                                    <th colSpan="2">Decision Logic</th>
                                </tr>
                            </thead>
                            <tbody>
                                {renderBooleanRow(
                                    "Enable model recommendation logic testing",
                                    "enabled"
                                )}
                                {renderBooleanRow(
                                    "Recommend model in viable bin",
                                    "recommend_viable"
                                )}
                                {renderBooleanRow(
                                    "Recommend model in questionable bin",
                                    "recommend_questionable"
                                )}
                                <tr>
                                    <td>
                                        Maximum BMDL range deemed &ldquo;sufficiently close&rdquo;
                                        <br />
                                        to use lowest AIC instead of lowest BMDL in viable models
                                    </td>
                                    <td className="text-center">
                                        {canEdit ? (
                                            <FloatInput
                                                className="form-control text-center"
                                                value={logic.sufficiently_close_bmdl}
                                                onChange={value =>
                                                    updateLogic("sufficiently_close_bmdl", value)
                                                }
                                            />
                                        ) : (
                                            <span>{logic.sufficiently_close_bmdl}</span>
                                        )}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }
}

DecisionLogic.propTypes = {
    logicStore: PropTypes.object,
};

export default DecisionLogic;
