import {
    extractErrorFromTraceback,
    parsePydanticError,
    parseServerErrors,
} from "../../src/utils/parsers";
import assert from "../helpers";

describe("Parsing", function() {
    describe("parseServerErrors", function() {
        it("handles no error correct", function() {
            assert.equal(parseServerErrors(""), null);
            assert.equal(parseServerErrors(null), null);
            assert.equal(parseServerErrors(undefined), null);
            assert.equal(parseServerErrors([]), null);
        });

        it("handles an unknown format", function() {
            const expected = {
                messages: ["An error has occurred"],
                message: "An error has occurred",
            };

            expected.data = ["ERROR"];
            assert.deepStrictEqual(parseServerErrors("ERROR"), expected);

            expected.data = [["ERROR"]];
            assert.deepStrictEqual(parseServerErrors(["ERROR"]), expected);

            expected.data = [{err: "ERROR"}];
            assert.deepStrictEqual(parseServerErrors({err: "ERROR"}), expected);

            expected.data = [[{err: "ERROR"}]];
            assert.deepStrictEqual(parseServerErrors([{err: "ERROR"}]), expected);
        });

        it("handles tracebacks", function() {
            assert.deepStrictEqual(
                parseServerErrors([
                    'Traceback (most recent call last):\n  File "/bmds-ui/bmds_ui/analysis/models.py", line 246, in try_run_session\n    return AnalysisSession.run(inputs, dataset_index, option_index)\nValueError: Doses are not unique\n',
                ]),
                {
                    data: [
                        'Traceback (most recent call last):\n  File "/bmds-ui/bmds_ui/analysis/models.py", line 246, in try_run_session\n    return AnalysisSession.run(inputs, dataset_index, option_index)\nValueError: Doses are not unique\n',
                    ],
                    messages: ["Doses are not unique"],
                    message: "Doses are not unique",
                }
            );
        });

        it("handles pydantic", function() {
            assert.deepStrictEqual(
                parseServerErrors([
                    '[{"type":"float_type","loc":["datasets",0,"function-after[num_groups(), MaxContinuousDatasetSchema]","doses",1],"msg":"Input should be a valid number","url":"https://errors.pydantic.dev/2.4/v/float_type"},{"type":"float_type","loc":["datasets",0,"function-after[num_groups(), MaxContinuousIndividualDatasetSchema]","doses",1],"msg":"Input should be a valid number","url":"https://errors.pydantic.dev/2.4/v/float_type"},{"type":"missing","loc":["datasets",0,"function-after[num_groups(), MaxContinuousIndividualDatasetSchema]","responses"],"msg":"Field required","url":"https://errors.pydantic.dev/2.4/v/missing"}]',
                ]),
                {
                    data: [
                        {
                            loc: [
                                "datasets",
                                0,
                                "function-after[num_groups(), MaxContinuousDatasetSchema]",
                                "doses",
                                1,
                            ],
                            msg: "Input should be a valid number",
                            type: "float_type",
                            url: "https://errors.pydantic.dev/2.4/v/float_type",
                        },
                        {
                            loc: [
                                "datasets",
                                0,
                                "function-after[num_groups(), MaxContinuousIndividualDatasetSchema]",
                                "doses",
                                1,
                            ],
                            msg: "Input should be a valid number",
                            type: "float_type",
                            url: "https://errors.pydantic.dev/2.4/v/float_type",
                        },
                        {
                            loc: [
                                "datasets",
                                0,
                                "function-after[num_groups(), MaxContinuousIndividualDatasetSchema]",
                                "responses",
                            ],
                            msg: "Field required",
                            type: "missing",
                            url: "https://errors.pydantic.dev/2.4/v/missing",
                        },
                    ],
                    messages: [
                        "datasets: Field required",
                        "datasets: Input should be a valid number",
                        "datasets: Input should be a valid number",
                    ],
                    message: "datasets: Field required\ndatasets: Input should be a valid number",
                }
            );
        });
    });

    describe("extractErrorFromTraceback", function() {
        it("extracts the error from a python traceback", function() {
            const tracebackErrors = [
                [
                    'Traceback (most recent call last):\n  File "/bmds-ui/bmds_ui/analysis/models.py", line 246, in try_run_session\n    return AnalysisSession.run(inputs, dataset_index, option_index)\nValueError: Doses are not unique\n',
                    "Doses are not unique",
                ],
                [
                    'Traceback (most recent call last):\n  File "/bmds-ui/bmds_ui/analysis/models.py", line 246, in try_run_session\n    return AnalysisSession.run(inputs, dataset_index, option_index)\nDoses are not unique\n',
                    "Doses are not unique",
                ],
                ["Fallthrough - no change", "Fallthrough - no change"],
            ];

            tracebackErrors.map(args => {
                const input = args[0],
                    result = args[1];
                assert.equal(extractErrorFromTraceback(input), result);
            });
        });
    });

    describe("parsePydanticError", function() {
        it("extracts the error from a pydantic exception", function() {
            const pydanticErrors = [
                [
                    [
                        {
                            loc: ["datasets", "remove"],
                            msg: "Input should be a valid number",
                        },
                    ],
                    ["datasets: Input should be a valid number"],
                ],
            ];

            pydanticErrors.map(args => {
                const input = args[0],
                    result = args[1];
                assert.allEqual(parsePydanticError(input), result);
            });
        });
    });
});
