import React from "react";

const ExternalAnchor = (href, text, classes) => {
    return (
        <a target="blank" className={classes} href={href}>
            {text}
        </a>
    );
};

export default ExternalAnchor;
