import PropTypes from "prop-types";
import React, {Component} from "react";

import {ff} from "@/utils/formatters";

import Popover from "./Popover";

class FloatingPointHover extends Component {
    render() {
        const {value} = this.props;
        return (
            <Popover element={"span"} content={value.toString()} title="Floating-Point Value">
                {ff(value)}
            </Popover>
        );
    }
}
FloatingPointHover.propTypes = {
    value: PropTypes.number.isRequired,
};

export default FloatingPointHover;
