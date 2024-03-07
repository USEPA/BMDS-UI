import PropTypes from "prop-types";
import React, {Component} from "react";

import Icon from "./Icon";
import Popover from "./Popover";

class LongFloatPopover extends Component {
    render() {
        const {icon, content} = this.props;
        return (
            <Popover element={"span"} content={content} title="Full Floating-Point Value">
                <Icon name={icon} classes="ml-1" />
            </Popover>
        );
    }
}
LongFloatPopover.propTypes = {
    icon: PropTypes.string,
    content: PropTypes.string.isRequired,
};
LongFloatPopover.defaultProps = {
    icon: "three-dots-vertical",
    title: "Floating-point-value",
};

export default LongFloatPopover;
