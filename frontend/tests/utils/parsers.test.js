import {ParseError} from "../../src/utils/parsers";
import assert from "../helpers";

const check = function(func, input, output) {
    assert.equal(func(input), output);
};

const error = [
    'Traceback (most recent call last): File "/usr/local/lib/python3.11/site-packages/bmds_server/analysis/models.py", line 237, in try_run_session return AnalysisSession.run(inputs, dataset_index, option_index) ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ File "/usr/local/lib/python3.11/site-packages/bmds_server/analysis/executor.py", line 134, in run session = cls.create(inputs, dataset_index, option_index) ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ File "/usr/local/lib/python3.11/site-packages/bmds_server/analysis/executor.py", line 140, in create dataset = build_dataset(inputs["datasets"][dataset_index]) ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ File "/usr/local/lib/python3.11/site-packages/bmds_server/analysis/transforms.py", line 93, in build_dataset return schema.model_validate(dataset).deserialize() ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ File "/usr/local/lib/python3.11/site-packages/bmds/datasets/continuous.py", line 247, in deserialize ds = ContinuousDataset( ^^^^^^^^^^^^^^^^^^ File "/usr/local/lib/python3.11/site-packages/bmds/datasets/continuous.py", line 104, in _init_ self._sort_by_dose_group() File "/usr/local/lib/python3.11/site-packages/bmds/datasets/continuous.py", line 116, in _sort_by_dose_group self._validate() File "/usr/local/lib/python3.11/site-packages/bmds/datasets/continuous.py", line 108, in _validate self._validate_summary_data() File "/usr/local/lib/python3.11/site-packages/bmds/datasets/continuous.py", line 23, in _validate_summary_data raise ValueError("Doses are not unique") ValueError: Doses are not unique',
    "",
];
const result = "Doses are not unique";

describe("Parsing", function() {
    describe("ParseError", function() {
        it("parses out the correct error message", function() {
            check(ParseError, error, result);
        });
    });
});
