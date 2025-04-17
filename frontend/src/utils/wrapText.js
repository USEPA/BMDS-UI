export const wrapText = (text, maxLength = 80, join = "\n") => {
    /**
     * Wraps a given text to a specific length.
     * @param {string} text - The input text to wrap.
     * @param {number} maxLength - The maximum line length.
     * @param {string} join - The string used to join wrapped lines.
     * @returns {string} - The wrapped text.
     */
    if (typeof text !== "string" || typeof maxLength !== "number" || maxLength <= 0) {
        throw new Error(
            "Invalid input: text must be a string and maxLength must be a positive number."
        );
    }

    const result = [];
    let currentLine = "";

    for (const word of text.split(" ")) {
        if ((currentLine + word).length > maxLength) {
            if (currentLine.length > 0) {
                result.push(currentLine.trim());
            }
            currentLine = word + " ";
        } else {
            currentLine += word + " ";
        }
    }

    if (currentLine.length > 0) {
        result.push(currentLine.trim());
    }

    return result.join(join);
};
