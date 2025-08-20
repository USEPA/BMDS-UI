import _ from "lodash";
import React from "react";

import Icon from "./components/common/Icon";

export const simulateClick = function (el) {
        // https://gomakethings.com/how-to-simulate-a-click-event-with-javascript/
        const evt = new MouseEvent("click", {
            bubbles: true,
            cancelable: true,
            view: window,
        });
        !el.dispatchEvent(evt);
    },
    randomString = function () {
        return "xxxxxxxxxxxxxxx".replace(/x/g, _c =>
            String.fromCharCode(97 + parseInt(26 * Math.random()))
        );
    },
    getHeaders = function (csrfToken) {
        return {
            "X-CSRFToken": csrfToken,
            "Content-Type": "application/json",
        };
    },
    checkOrEmpty = bool => {
        return (
            <Icon
                title={bool ? "checked" : "unchecked"}
                name={bool ? "check2-square" : "square"}
                classes="bi-lg"
            />
        );
    },
    getLabel = function (value, mapping) {
        return _.find(mapping, d => d.value == value).label;
    },
    getBlob = function (response, defaultName) {
        const header = response.headers.get("Content-Disposition"),
            match = header.match(/filename="(.*)"/),
            filename = match ? match[1] : defaultName;
        return response.blob().then(blob => ({blob, filename}));
    };
