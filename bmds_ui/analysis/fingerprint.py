import hashlib
import json

INPUT_FIELDS = (
    "dataset_type",
    "datasets",
    "dataset_options",
    "models",
    "options",
)

OUTPUT_FIELDS = (
    "analysis_schema_version",
    "bmds_ui_version",
    "bmds_python_version",
    "outputs",
)


def build_fingerprint(inputs: dict, outputs: dict) -> str:
    payload = {
        "fingerprint_format": "BMDS-v1-sha256",
        "inputs": {
            **{key: inputs[key] for key in INPUT_FIELDS},
            "analysis_name": inputs.get("analysis_name", ""),
            "analysis_description": inputs.get("analysis_description", ""),
            "recommender": inputs.get("recommender"),
        },
        "outputs": {key: outputs[key] for key in OUTPUT_FIELDS},
    }

    canonical = json.dumps(
        payload,
        sort_keys=True,
        separators=(",", ":"),
        ensure_ascii=True,
        allow_nan=False,
    ).encode("ascii")

    return "BMDS-v1-sha256:" + hashlib.sha256(canonical).hexdigest()
