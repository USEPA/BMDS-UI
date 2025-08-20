import {Provider} from "mobx-react";
import React from "react";
import ReactDOM from "react-dom";

import App from "./App";
import Store from "./store";

const render = function(el, token) {
    const store = new Store(token);
    ReactDOM.render(
        <Provider store={store}>
            <App />
        </Provider>,
        el
    );
};

export default render;
