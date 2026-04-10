import { Provider } from "mobx-react";
import React from "react";
import ReactDOM from "react-dom";

import App from "./App";
import Store from "./store";
import DataStore from "../../../stores/DataStore";

const render = function (el, token) {
  const store = new Store(token);
  const dataStore = new DataStore();
  ReactDOM.render(
    <Provider store={store} dataStore={dataStore}>
      <App />
    </Provider>,
    el,
  );
};

export default render;
