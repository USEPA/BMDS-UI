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
    },
    parseCSVToObjects = function (csv, columns) {
        if (typeof csv !== "string" || !Array.isArray(columns) || columns.length === 0) {
            return {};
        }

        const lines = csv.split(/\r?\n/);

        const normalizedHeader = lines[0].replace(/[\s,]+/g, ",");
        const headerMatches = lines.length > 0 && normalizedHeader === columns.join(",");

        const dataLines = headerMatches ? lines.slice(1) : lines;

        const result = {};
        columns.forEach(key => (result[key] = []));

        for (const line of dataLines) {
            if (line.length === 0) continue; // skip completely empty lines
            const cells = line.replace(/[\s,]+/g, ",").split(",");
            for (let i = 0; i < columns.length; i++) {
                const raw = cells[i] !== undefined ? cells[i] : "";
                result[columns[i]].push(raw === "" || /^na$/i.test(raw) ? null : raw);
            }
        }

        return result;
    },
    toCSV = function (data, headers) {
        const rows = Array.from({length: data[headers[0]].length}, (_, i) =>
            headers.map(key => data[key][i])
        );

        const filteredRows = rows.filter(row => {
            return (
                Array.isArray(row) &&
                row.some(cell => cell !== "" && cell != null && !Number.isNaN(cell))
            );
        });

        return headers.join(",") + "\n" + filteredRows.map(row => row.join(",")).join("\n");
    };
