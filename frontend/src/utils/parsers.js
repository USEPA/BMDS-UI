import _ from "lodash";

export const parseServerErrors = errors => {
        // parse errors from server response. They may come in a variety of formats, so we always
        // want to show at least an error message if we cannot parse into a better format

        if (_.isEmpty(errors)) {
            return null;
        }

        let errorWasParsed = false;

        const container = {
            data: [],
            messages: [],
            message: "",
        };

        console.warn(`Complete errors:\n\n ${errors}`);

        if (Array.isArray(errors)) {
            errors.map(error => {
                if (typeof error === "string") {
                    const lower = error.toLowerCase();
                    if (lower.includes("pydantic")) {
                        errorWasParsed = true;
                        const msg = JSON.parse(error);
                        container.data.push(...msg);
                        container.messages.push(...parsePydanticError(msg));
                    } else if (lower.includes("traceback")) {
                        errorWasParsed = true;
                        container.data.push(error);
                        container.messages.push(extractErrorFromTraceback(error));
                    }
                }
            });
        }

        if (!errorWasParsed) {
            container.data.push(errors);
            container.messages.push("An error has occurred");
        }

        // return a single unique set of messages as a single string. This is used in the UI
        container.message = _.uniq(container.messages)
            .join("\n")
            .trim();

        return container;
    },
    parsePydanticError = errors => {
        return errors
            .map(error => {
                if (error.loc && error.msg) {
                    return `${error.loc[0]}: ${error.msg}`;
                }
                return JSON.stringify(error);
            })
            .sort();
    },
    extractErrorFromTraceback = error => {
        // if this is a traceback from python just return the last line
        if (!error.includes("Traceback")) {
            return error;
        }
        const lines = error.trim().split("\n"),
            line = lines[lines.length - 1],
            colonIndex = line.indexOf(":");
        if (colonIndex >= 0) {
            return line.substring(colonIndex + 1).trim();
        }
        return line;
    };


export const parseError = function(error) {
    console.error(`Complete stacktrace:\n\n ${error}`);
-    let _error = error.match(/(?<=ValueError:\s).*/)[0];
+    let _error = error[0].match(/(?<=ValueError:\s).*/);
    return _error.toString();
};
