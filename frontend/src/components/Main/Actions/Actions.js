import _ from "lodash";
import {inject, observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";

import Button from "../../common/Button";
import Icon from "../../common/Icon";
import CollectionForm from "./CollectionForm";

const getDeletionDateText = function(editSettings) {
    const date = editSettings.deleteDateStr,
        days = editSettings.deletionDaysUntilDeletion;
    return `${date} (${days} days)`;
};

@inject("mainStore")
@observer
class Actions extends Component {
    render() {
        const {mainStore} = this.props,
            {config} = mainStore;
        return (
            <div className="dropdown">
                <Button
                    text="Actions&nbsp;"
                    className="btn btn-primary dropdown-toggle"
                    type="button"
                    id="bmdSessionActions"
                    dataToggle="dropdown"
                    hasPopup={true}
                />
                <div
                    className="dropdown-menu dropdown-menu-right"
                    style={{minWidth: 360}}
                    aria-labelledby="bmdSessionActions">
                    {mainStore.canEdit ? (
                        <>
                            <span className="dropdown-header">Edit settings</span>
                            <div className="dropdown-item form-group mb-0">
                                <label
                                    htmlFor="loadAnalysisFile"
                                    className="mb-0"
                                    style={{
                                        fontWeight: "normal",
                                        cursor: "pointer",
                                        display: "block",
                                    }}>
                                    <Icon name="upload" text="Load analysis" />
                                </label>
                                <input
                                    id="loadAnalysisFile"
                                    type="file"
                                    className="hiddenInputFile"
                                    onChange={e => {
                                        mainStore.loadAnalysisFromFile(e.target.files[0]);
                                        e.target.value = "";
                                    }}
                                />
                            </div>
                            {_.isNumber(config.editSettings.deletionDaysUntilDeletion) &&
                            !mainStore.isDesktop ? (
                                <>
                                    <a
                                        className="dropdown-item"
                                        href={config.editSettings.renewUrl}>
                                        <Icon name="calendar3" text="Extend deletion date" />
                                    </a>
                                    <p className="text-muted pl-4 mb-0">
                                        <b>Deletion date:</b>&nbsp;
                                        {getDeletionDateText(config.editSettings)}
                                    </p>
                                </>
                            ) : null}
                            {!mainStore.isDesktop ? (
                                <a className="dropdown-item" href={config.editSettings.deleteUrl}>
                                    <Icon name="trash3-fill" text="Delete analysis" />
                                </a>
                            ) : null}
                            <div className="dropdown-divider"></div>
                        </>
                    ) : null}
                    <span className="dropdown-header">Reporting</span>
                    {mainStore.analysisSavedAndValidated && mainStore.hasOutputs ? (
                        <>
                            <Button
                                className="dropdown-item"
                                onClick={() => mainStore.downloadReport("excelUrl")}
                                icon="file-excel"
                                text="Download data"
                            />
                            <Button
                                className="dropdown-item"
                                onClick={mainStore.showWordReportOptionModal}
                                icon="file-word"
                                text="Download report"
                            />
                            <a
                                className="dropdown-item"
                                href="#"
                                onClick={e => {
                                    e.preventDefault();
                                    mainStore.saveAnalysisToFile();
                                }}>
                                <Icon name="download" text="Download analysis" />
                            </a>
                        </>
                    ) : (
                        <p className="text-muted pl-4 mb-0">Please save and execute analysis.</p>
                    )}
                    {mainStore.isDesktop ? (
                        <>
                            <div className="dropdown-divider"></div>
                            <span className="dropdown-header">Collections</span>
                            <CollectionForm />
                        </>
                    ) : null}
                </div>
            </div>
        );
    }
}
Actions.propTypes = {
    mainStore: PropTypes.object,
};
export default Actions;
