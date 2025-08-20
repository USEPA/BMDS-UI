import {
    extractErrorFromTraceback,
    parsePydanticError,
    parseServerErrors,
} from "../../src/utils/parsers";
import assert from "../helpers";

describe("Parsing", () => {
    describe("parseServerErrors", () => {
        it("handles no error correct", () => {
            assert.equal(parseServerErrors(""), null);
            assert.equal(parseServerErrors(null), null);
            assert.equal(parseServerErrors(undefined), null);
            assert.equal(parseServerErrors([]), null);
        });

        it("handles an unknown format", () => {
            assert.deepStrictEqual(parseServerErrors("ERROR"), {
                data: ["ERROR"],
                messages: ["An error has occurred"],
                message: "An error has occurred",
            });

            assert.deepStrictEqual(parseServerErrors(["ERROR"]), {
                data: ["ERROR"],
                messages: ["ERROR"],
                message: "ERROR",
            });

            assert.deepStrictEqual(parseServerErrors({err: "ERROR"}), {
                data: [{err: "ERROR"}],
                messages: ["An error has occurred"],
                message: "An error has occurred",
            });

            assert.deepStrictEqual(parseServerErrors([{err: "ERROR"}]), {
                data: [[{err: "ERROR"}]],
                messages: ["An error has occurred"],
                message: "An error has occurred",
            });
        });

        it("handles tracebacks", () => {
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

        it("handles pydantic", () => {
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

    describe("extractErrorFromTraceback", () => {
        it("extracts the error from a python traceback", () => {
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
                const input = args[0];
                const result = args[1];
                assert.equal(extractErrorFromTraceback(input), result);
            });
        });
    });

    describe("parsePydanticError", () => {
        it("extracts the error from a pydantic exception", () => {
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
                const input = args[0];
                const result = args[1];
                assert.allEqual(parsePydanticError(input), result);
            });
        });
    });
});
