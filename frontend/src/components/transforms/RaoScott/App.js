import {inject, observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";

import AboutModal from "./AboutModal";
import InputForm from "./InputForm";

@inject("store")
@observer
class App extends Component {
    render() {
        const {showAboutModal, setAboutModal} = this.props.store;
        return (
            <div className="container py-3">
                <div className="d-flex justify-content-between">
                    <h2>Rao Scott Adjustment</h2>
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => setAboutModal(true)}>
                        About
                    </button>
                </div>
                <>{showAboutModal ? <AboutModal store={this.props.store} /> : null}</>
                <p className="text-muted col-lg-8">...</p>
                <h3>Settings</h3>
                <InputForm />
            </div>
        );
    }
}
App.propTypes = {
    store: PropTypes.object,
};
export default App;
