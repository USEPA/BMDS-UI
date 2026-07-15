import PropTypes from "prop-types";
import React, {Component} from "react";

import Icon from "./Icon";
import Popover from "./Popover";

class HelpTextPopover extends Component {
    render() {
        const {icon, title, content} = this.props;
        return (
            <Popover element={"span"} content={content} title={title}>
                <Icon name={icon} classes="ml-1" />
            </Popover>
        );
    }
}
HelpTextPopover.propTypes = {
    icon: PropTypes.string,
    title: PropTypes.string,
    content: PropTypes.string.isRequired,
};
HelpTextPopover.defaultProps = {
    icon: "question-circle-fill",
    title: "Help Text",
};

export default HelpTextPopover;
