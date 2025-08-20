import {inject, observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";

import Button from "../../common/Button";
import ClipboardButton from "../../common/ClipboardButton";
import Icon from "../../common/Icon";

@inject("mainStore")
@observer
class ShareActions extends Component {
    render() {
        const {editSettings} = this.props.mainStore.config;
        return (
            <div className="dropdown">
                <Button
                    text="Share&nbsp;"
                    className="btn btn-success dropdown-toggle"
                    dataToggle="dropdown"
                    hasPopup={true}
                />
                <div
                    style={{minWidth: 300}}
                    className="dropdown-menu dropdown-menu-right"
                    aria-labelledby="bmdSessionShare">
                    <form>
                        {/* READ ONLY LINK */}
                        <span className="dropdown-header">Read-only link</span>
                        <div
                            className="dropdown-item btn-group btn-block"
                            role="group"
                            aria-label="Basic example">
                            <ClipboardButton
                                text="Copy link"
                                textToCopy={editSettings.viewUrl}
                                className="btn btn-secondary mr-1"
                            />
                            <a
                                href={editSettings.viewUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-secondary text-white">
                                <Icon name="box-arrow-up-right" text="Open" />
                            </a>
                        </div>
                        <p className="dropdown-item text-muted" style={{whiteSpace: "normal"}}>
                            Anyone with this link can view the analysis and download reports.
                        </p>
                        {/* EDIT LINK */}
                        <div className="dropdown-divider" />
                        <span className="dropdown-header">Edit link</span>
                        <div
                            className="dropdown-item btn-group btn-block"
                            role="group"
                            aria-label="Basic example">
                            <ClipboardButton
                                text="Copy link"
                                textToCopy={editSettings.editUrl}
                                className="btn btn-warning mr-1"
                            />
                            <a
                                href={editSettings.editUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-warning">
                                <Icon name="box-arrow-up-right" text="Open" />
                            </a>
                        </div>
                        <p className="dropdown-item text-muted" style={{whiteSpace: "normal"}}>
                            Anyone with this link can edit the analysis.
                        </p>
                    </form>
                </div>
            </div>
        );
    }
}
ShareActions.propTypes = {
    mainStore: PropTypes.object,
};
export default ShareActions;
