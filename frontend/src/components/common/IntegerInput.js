import _ from "lodash";
import { observer } from "mobx-react";
import PropTypes from "prop-types";
import React, { Component } from "react";

import { randomString } from "@/common";

import LabelInput from "./LabelInput";

@observer
class IntegerInput extends Component {
  constructor(props) {
    super(props);
    this._id = props.id || randomString();
  }
  render() {
    const { label, onChange, value, max, min } = this.props;
    return (
      <>
        {label ? <LabelInput label={label} htmlFor={this._id} /> : null}
        <input
          id={this._id}
          className="form-control"
          type="number"
          step={1}
          value={value}
          onChange={(e) => {
            const value = parseInt(e.target.value);
            onChange(_.isFinite(value) ? value : "");
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowUp" || e.key === "ArrowDown") {
              e.preventDefault();
            }
          }}
          onBlur={(e) => {
            let value = parseInt(e.target.value);
            if (!_.isFinite(value)) return;
            if (max !== undefined && value > max) value = max;
            if (min !== undefined && value < min) value = min;
            onChange(value);
          }}
        />
      </>
    );
  }
}

IntegerInput.propTypes = {
  id: PropTypes.string,
  label: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.any.isRequired,
  min: PropTypes.number,
  max: PropTypes.number,
};

export default IntegerInput;
