import {inject, observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";
import {NavLink, Redirect, Route, Switch} from "react-router-dom";

import DataTab from "./Data/DataTab";
import LogicRoot from "./Logic/LogicRoot";
import Actions from "./Main/Actions/Actions";
import ShareActions from "./Main/Actions/ShareActions";
import Starred from "./Main/Actions/Starred";
import StatusToast from "./Main/Actions/StatusToast";
import WordReportOptionsModal from "./Main/Actions/WordReportOptionsModal";
import Main from "./Main/Main";
import Output from "./Output/Output";

@inject("mainStore")
@observer
class Navigation extends Component {
    render() {
        const {mainStore} = this.props;
        const {isMultiTumor} = mainStore;
        return (
            <>
                <ul className="nav nav-tabs d-flex mt-3">
                    <li className="nav-item">
                        <NavLink className="nav-link" to="/" exact={true}>
                            Settings
                        </NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink className="nav-link" to="/data">
                            Data
                        </NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink id="navlink-output" className="nav-link" to="/output">
                            Output
                        </NavLink>
                    </li>
                    {isMultiTumor ? null : (
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/logic">
                                Logic
                            </NavLink>
                        </li>
                    )}
                    {mainStore.canEdit && !mainStore.isDesktop ? (
                        <li className="nav-item ml-auto mr-1">{<ShareActions />}</li>
                    ) : (
                        <span className="ml-auto" />
                    )}
                    <Starred />
                    <li
                        className={mainStore.canEdit ? "nav-item" : "nav-item ml-auto"}
                        style={{position: "relative"}}>
                        <Actions />
                        <WordReportOptionsModal />
                    </li>
                </ul>
                <div className="content mt-2">
                    <Switch>
                        <Route exact path="/" component={Main} />
                        <Route path="/data" component={DataTab} />
                        <Route path="/logic" component={LogicRoot} />
                        <Route path="/output" component={Output} />
                        <Route path="*">
                            <Redirect to="/" />
                        </Route>
                    </Switch>
                </div>
                <div className="toast-container">
                    {/* put toasts at the end so it's above everything else */}
                    <StatusToast />
                </div>
            </>
        );
    }
}
Navigation.propTypes = {
    mainStore: PropTypes.object,
    wordUrl: PropTypes.string,
    ExcelUrl: PropTypes.string,
    config: PropTypes.object,
};
export default Navigation;
