import React from "react";

export default (href, text, classes) => {
    return (
        <a target="blank" className={classes} href={href}>
            {text}
        </a>
    );
};
