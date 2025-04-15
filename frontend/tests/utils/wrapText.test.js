import {wrapText} from "../../src/utils/wrapText";
import assert from "../helpers";

describe("wrapText", () => {
    it("should wrap text at the max length", () => {
        assert.equal(wrapText("text text", 4), "text\ntext");
    });

    it("should handle text shorter than max length", () => {
        assert.equal(wrapText("text", 2), "text");
    });

    it("should handle exact max length text", () => {
        assert.equal(wrapText("text", 4), "text");
    });

    it("should use the provided join string", () => {
        assert.equal(wrapText("text text", 4, " | "), "text | text");
    });

    it("should handle empty text", () => {
        const text = "";
        assert.equal(wrapText(text, 10), text);
    });

    it("should handle single long word", () => {
        const text = "Supercalifragilisticexpialidocious";
        assert.equal(wrapText(text, 10), text);
    });
});
