import {observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";

import {randomString} from "@/common";
import LabelInput from "./LabelInput";

@observer
class PermutationsInput extends Component {
    constructor(props) {
        super(props);
        this._id = "permutation_input";
    }

    handleChange = e => {
        const {onChange} = this.props;
        const raw = e.target.value;

        // Blank -> null (use auto/exact/approximate path)
        if (raw === "") {
            onChange(null);
            return;
        }

        // Parse and keep integers only
        const n = parseInt(raw, 10);
        if (Number.isNaN(n)) {
            // ignore invalid keystrokes
            return;
        }

        onChange(n);
    };

    handleBlur = e => {
        const {min, max, onChange} = this.props;
        const raw = e.target.value;
        if (raw === "") return;

        let n = parseInt(raw, 10);
        if (Number.isNaN(n)) return;

        // Clamp to [min, max] if provided
        if (min != null) n = Math.max(min, n);
        if (max != null) n = Math.min(max, n);

        onChange(n);
    };

    render() {
        const {label, value, min, max, step, placeholder} = this.props;
        const inputValue = value == null ? "" : String(value);

        return (
            <>
                {label ? <LabelInput label={label} htmlFor={this._id} /> : null}
                <input
                    id={this._id}
                    className="form-control"
                    type="number"
                    onKeyDown={e => {
                        if (["e", "E", "+", "-", "."].includes(e.key)) {
                            e.preventDefault();
                        }
                    }}
                    onPaste={e => {
                        const paste = (e.clipboardData || window.clipboardData).getData("text");
                        if (!/^\d+$/.test(paste)) e.preventDefault();
                    }}
                    min={min}
                    max={max}
                    step={step}
                    value={inputValue}
                    placeholder={placeholder}
                    onChange={this.handleChange}
                    onBlur={this.handleBlur}
                />
            </>
        );
    }
}

PermutationsInput.propTypes = {
    id: PropTypes.string,
    label: PropTypes.string,
    // number of permutations; null/undefined means "auto" (use exact/approx)
    value: PropTypes.oneOfType([PropTypes.number, PropTypes.oneOf([null])]),
    onChange: PropTypes.func.isRequired,
    min: PropTypes.number, // e.g., 1
    max: PropTypes.number, // optional cap
    step: PropTypes.number, // e.g., 1
    placeholder: PropTypes.string,
};

PermutationsInput.defaultProps = {
    value: null,
    min: 1,
    max: undefined,
    step: 1,
    placeholder: "Auto",
};

export default PermutationsInput;
