import PropTypes from "prop-types";
import React from "react";

class Spinner extends React.Component {
    render() {
        return (
            <span>
                {this.props.text}
                <span className="ml-2 spinner-border text-info" aria-hidden="true" />
            </span>
        );
    }
}
Spinner.propTypes = {
    text: PropTypes.string,
};

Spinner.defaultProps = {
    text: "Loading, please wait...",
};

export default Spinner;
