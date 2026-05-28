import { observer } from "mobx-react";
import PropTypes from "prop-types";
import React, { Component } from "react";
import _ from "lodash";

import { randomString } from "@/common";

import LabelInput from "./LabelInput";

@observer
class FloatInput extends Component {
  constructor(props) {
    super(props);
    this._id = props.id || randomString();
  }
  render() {
    const { label, className, value, onChange, disabled } = this.props;
    return (
      <>
        {label ? <LabelInput label={label} htmlFor={this._id} /> : null}
        <input
          id={this._id}
          disabled={disabled}
          className={className}
          type="number"
          defaultValue={value ?? ""}
          //   onChange={(e) => onChange(parseFloat(e.target.value))}
          onBlur={(e) => {
            const raw = e.target.value.trim();
            if (raw === "") {
              onChange(null);
              return;
            }
            const parsed = parseFloat(e.target.value);
            if (_.isFinite(parsed)) {
              onChange(parsed);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowUp" || e.key === "ArrowDown") {
              e.preventDefault();
            }
          }}
        />
      </>
    );
  }
}

FloatInput.propTypes = {
  id: PropTypes.string,
  label: PropTypes.string,
  className: PropTypes.string,
  value: PropTypes.number,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};
FloatInput.defaultProps = {
  className: "form-control",
  disabled: false,
};

export default FloatInput;
