import {observer} from "mobx-react";
import PropTypes from "prop-types";
import React, {Component} from "react";

import {randomString} from "@/common";

@observer
class CheckboxInput extends Component {
    constructor(props) {
        super(props);
        this._id = props.id || randomString();
    }
    render() {
        const {onChange, checked, disabled} = this.props;
        return (
            <input
                id={this._id}
                type="checkbox"
                checked={checked}
                disabled={disabled}
                onChange={e => onChange(e.target.checked)}
            />
        );
    }
}

CheckboxInput.propTypes = {
    id: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    checked: PropTypes.any.isRequired,
    disabled: PropTypes.bool,
};
CheckboxInput.defaultProps = {
    disabled: false,
};

export default CheckboxInput;
