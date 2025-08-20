import _ from "lodash";
import React from "react";

import Icon from "./components/common/Icon";

export const simulateClick = el => {
        // https://gomakethings.com/how-to-simulate-a-click-event-with-javascript/
        const evt = new MouseEvent("click", {
            bubbles: true,
            cancelable: true,
            view: window,
        });
        !el.dispatchEvent(evt);
    },
    randomString = () =>
        "xxxxxxxxxxxxxxx".replace(/x/g, _c =>
            String.fromCharCode(97 + Number.parseInt(26 * Math.random()))
        ),
    getHeaders = csrfToken => ({
        "X-CSRFToken": csrfToken,
        "Content-Type": "application/json",
    }),
    checkOrEmpty = bool => {
        return (
            <Icon
                title={bool ? "checked" : "unchecked"}
                name={bool ? "check2-square" : "square"}
                classes="bi-lg"
            />
        );
    },
    getLabel = (value, mapping) => _.find(mapping, d => d.value === value).label,
    getBlob = (response, defaultName) => {
        const header = response.headers.get("Content-Disposition");
        const match = header.match(/filename="(.*)"/);
        const filename = match ? match[1] : defaultName;
        return response.blob().then(blob => ({blob, filename}));
    };
