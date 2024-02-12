import PropTypes from "prop-types";
import React from "react";

const ErrorMessage = ({error}) => {
    if (!error) {
        return null;
    }
    return (
        <div className="alert alert-danger mb-3">
            <pre className="text-wrap mb-0">{error}</pre>
        </div>
    );
};
ErrorMessage.propTypes = {
    error: PropTypes.string,
};

export default ErrorMessage;
