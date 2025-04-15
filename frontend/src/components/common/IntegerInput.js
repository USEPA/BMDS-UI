import _ from "lodash";
import {observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";

import {randomString} from "@/common";

import LabelInput from "./LabelInput";

@observer
class IntegerInput extends Component {
    constructor(props) {
        super(props);
        this._id = props.id || randomString();
    }
    render() {
        const {label, onChange, value} = this.props;
        return (
            <>
                {label ? <LabelInput label={label} htmlFor={this._id} /> : null}
                <input
                    id={this._id}
                    className="form-control"
                    type="number"
                    step={1}
                    value={value}
                    onChange={e => {
                        const value = parseInt(e.target.value);
                        onChange(_.isFinite(value) ? value : "");
                    }}
                    onKeyDown={e => {
                        if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                            e.preventDefault();
                        }
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
};

export default IntegerInput;
