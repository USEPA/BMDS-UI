import _ from "lodash";
import PropTypes from "prop-types";
import React, {Component} from "react";

import $ from "$";

class Popover extends Component {
    constructor(props) {
        super(props);
        this.domNode = React.createRef();
    }
    componentDidMount() {
        $(this.domNode.current).popover({placement: "auto", trigger: "hover"});
    }
    componentWillUnmount() {
        $(this.domNode.current).popover("dispose");
    }
    render() {
        const {children, content, title, element, attrs} = this.props;
        let props = _.fromPairs([
            ["ref", this.domNode],
            ["title", title],
            ["aria-hidden", "true"],
            ["data-html", "true"],
            ["data-toggle", "popover"],
            ["data-content", content],
        ]);
        if (attrs) {
            _.extend(props, attrs);
        }
        return React.createElement(element, props, children);
    }
}
Popover.propTypes = {
    element: PropTypes.string,
    content: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
    attrs: PropTypes.object,
};
Popover.defaultProps = {
    element: "div",
};

export default Popover;
