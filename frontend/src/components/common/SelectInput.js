import {observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";

import {randomString} from "@/common";

import LabelInput from "./LabelInput";

@observer
class SelectInput extends Component {
    constructor(props) {
        super(props);
        this._id = props.id || randomString();
    }
    render() {
        const {label, onChange, value, choices} = this.props;
        return (
            <>
                {label ? <LabelInput label={label} htmlFor={this._id} /> : null}
                <select
                    id={this._id}
                    className="form-control"
                    onChange={e => onChange(e.target.value)}
                    value={value}>
                    {choices.map(choice => {
                        return (
                            <option
                                key={choice.value}
                                value={choice.value}
                                disabled={choice.disabled}>
                                {choice.text}
                            </option>
                        );
                    })}
                </select>
            </>
        );
    }
}

SelectInput.propTypes = {
    id: PropTypes.string,
    label: PropTypes.string,
    choices: PropTypes.arrayOf(
        PropTypes.shape({
            value: PropTypes.any.isRequired,
            text: PropTypes.string.isRequired,
            disabled: PropTypes.bool,
        })
    ).isRequired,
    onChange: PropTypes.func.isRequired,
    value: PropTypes.any.isRequired,
};

export default SelectInput;
