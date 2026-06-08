import { inject, observer } from "mobx-react";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import { MODEL_DICHOTOMOUS } from "@/constants/mainConstants";

const Tabs = observer(({ modelsStore }) => {
  const handleClick = (tab) => (e) => {
    e.preventDefault();
    modelsStore.setActiveTab(tab);
  };

  // Do not render tabs for other models.
  if (!modelsStore.hasTabs()) {
    return null;
  }

  return (
    <ul className="nav nav-tabs d-flex mt-3 mb-2" role="tablist">
      <li className="nav-item">
        <NavLink
          className={`nav-link ${modelsStore.isActive("loud_bayesian") ? "active" : ""}`}
          to="/x"
          exact={true}
          onClick={handleClick("loud_bayesian")}
          aria-current={
            modelsStore.isActive("loud_bayesian") ? "page" : undefined
          }
          role="tab"
          aria-selected={modelsStore.isActive("loud_bayesian")}
        >
          LOUD Bayesian Model Averaging{" ("}
          {modelsStore.tabBadge["loud_bayesian"]}
          {")"}
        </NavLink>
      </li>

      {modelsStore.getModelType !== MODEL_DICHOTOMOUS ? null : (
        <li className="nav-item">
          <NavLink
            className={`nav-link ${modelsStore.isActive("toxicr_bayesian") ? "active" : ""}`}
            to="/x"
            onClick={handleClick("toxicr_bayesian")}
            aria-current={
              modelsStore.isActive("toxicr_bayesian") ? "page" : undefined
            }
            role="tab"
            aria-selected={modelsStore.isActive("toxicr_bayesian")}
          >
            ToxicR Bayesian Model Averaging{" ("}
            {modelsStore.tabBadge["toxicr_bayesian"]}
            {")"}
          </NavLink>
        </li>
      )}

      <li className="nav-item">
        <NavLink
          id="navlink-output"
          className={`nav-link ${modelsStore.isActive("mle") ? "active" : ""}`}
          to="/x"
          onClick={handleClick("mle")}
          aria-current={modelsStore.isActive("mle") ? "page" : undefined}
          role="tab"
          aria-selected={modelsStore.isActive("mle")}
        >
          Maximum Likelihood Estimate{" ("}
          {modelsStore.tabBadge["mle"]}
          {")"}
        </NavLink>
      </li>
    </ul>
  );
});

@inject(({ modelsStore }) => ({
  modelsStore,
}))
@observer
class ModelsSelectionTabs extends Component {
  render() {
    const { modelsStore } = this.props;

    return <Tabs modelsStore={modelsStore} />;
  }
}

ModelsSelectionTabs.propTypes = {
  modelsStore: PropTypes.object,
};

export default ModelsSelectionTabs;
