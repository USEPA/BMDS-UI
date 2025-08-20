import PropTypes from "prop-types";
import React, {Component} from "react";

class InlineMath extends Component {
    render() {
        const {f} = this.props;
        return <span dangerouslySetInnerHTML={{__html: `$${f}$`}} />;
    }
}
InlineMath.propTypes = {
    f: PropTypes.string.isRequired,
};

export const typesetMath = function () {
    if (window.MathJax) {
        window.MathJax.typesetPromise();
    }
};
export default InlineMath;
