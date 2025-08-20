import _ from "lodash";
import {autorun} from "mobx";
import {inject, observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";
import {HashRouter} from "react-router-dom";

import Navigation from "@/components/Navigation";
import Icon from "@/components/common/Icon";

@inject("mainStore")
@observer
class App extends Component {
    componentDidMount() {
        const config = JSON.parse(document.getElementById("config").textContent);
        this.props.mainStore.setConfig(config);
        this.props.mainStore.fetchSavedAnalysis();

        // update HTML document title
        autorun(() => {
            const {analysis_name, canEdit} = this.props.mainStore;
            const verb = canEdit ? "Update" : "";
            const name = analysis_name ? analysis_name : "";
            const app_name = this.props.mainStore.config.is_desktop
                ? "BMDS Desktop"
                : "BMDS Online";
            document.title = _.reject([name, verb, app_name], _.isEmpty).join(" | ");
        });
    }
    render() {
        const {analysis_name, canEdit, isFuture} = this.props.mainStore;
        const getHeader = () => {
            if (canEdit) {
                return "Update BMDS analysis";
            }
            return analysis_name ? analysis_name : "BMDS analysis";
        };

        return this.props.mainStore.isUpdateComplete ? (
            <HashRouter>
                <h2>
                    {getHeader()}
                    {isFuture ? (
                        <span
                            className="badge badge-dark ml-3"
                            title="Future mode: content under active development">
                            <Icon name="lightning-fill" />
                            &nbsp;FUTURE MODE&nbsp;
                            <Icon name="lightning-fill" />
                        </span>
                    ) : null}
                </h2>
                <Navigation />
            </HashRouter>
        ) : null;
    }
}
App.propTypes = {
    mainStore: PropTypes.object,
};
export default App;
