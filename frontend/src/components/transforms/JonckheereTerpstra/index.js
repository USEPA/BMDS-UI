import { Provider } from "mobx-react";
import React from "react";
import ReactDOM from "react-dom";

import App from "./App";
import Store from "./store";
// import rootStore from "../../../stores/RootStore";
import rootStore from "@/stores/RootStore";

const render = function (el, token) {
  const store = new Store(token);
  ReactDOM.render(
    <Provider store={store} dataStore={rootStore.dataStore}>
      <App />
    </Provider>,
    el,
  );
};

export default render;
