import Clipboard from "clipboard";
import PropTypes from "prop-types";
import React, {Component} from "react";

import Icon from "./Icon";

class ClipboardButton extends Component {
    // copy text to clipboard
    constructor(props) {
        super(props);
        this.ref = React.createRef();
    }
    componentDidMount() {
        const {textToCopy, onCopy} = this.props;
        this.clipboardEvent = new Clipboard(this.ref.current, {text: () => textToCopy});
        if (onCopy) {
            this.clipboardEvent.on("success", onCopy);
        }
    }
    componentWillUnmount() {
        this.clipboardEvent.destroy();
    }
    render() {
        const {className, textToCopy, text} = this.props;
        return (
            <button
                ref={this.ref}
                type="button"
                className={className}
                title={`Copy "${textToCopy}" to clipboard`}>
                <Icon name="clipboard" text={text} />
            </button>
        );
    }
}

ClipboardButton.propTypes = {
    text: PropTypes.string.isRequired,
    textToCopy: PropTypes.string.isRequired,
    className: PropTypes.string.isRequired,
    onCopy: PropTypes.func,
};
ClipboardButton.defaultProps = {
    text: "",
};

export default ClipboardButton;
