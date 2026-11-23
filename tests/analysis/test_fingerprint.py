from __future__ import annotations

from copy import deepcopy

import pytest
from django.urls import reverse
from rest_framework.test import APIClient

from bmds_ui.analysis.fingerprint import build_fingerprint
from bmds_ui.analysis.models import Analysis


def _sample_inputs() -> dict:
    return {
        "dataset_type": "C",
        "datasets": [
            {
                "dtype": "C",
                "metadata": {"id": 1, "name": "Dataset #1"},
                "doses": [0, 10],
                "ns": [5, 5],
                "means": [1.0, 2.0],
                "stdevs": [0.1, 0.2],
            }
        ],
        "dataset_options": [{"dataset_id": 1, "enabled": True, "degree": 0}],
        "models": {"frequentist_restricted": ["Power"]},
        "options": [{"bmr_type": 2, "bmr_value": 1, "confidence_level": 0.95}],
        "analysis_name": "A",
        "analysis_description": "B",
        "recommender": {"rules": []},
    }


def _sample_outputs() -> dict:
    return {
        "analysis_id": "11111111-1111-1111-1111-111111111111",
        "analysis_schema_version": "1.2",
        "bmds_ui_version": "2026.01",
        "bmds_python_version": {"python": "1.0.0", "dll": "1.0.0"},
        "outputs": [
            {
                "dataset_index": 0,
                "option_index": 0,
                "frequentist": {
                    "selected": {"model_index": None, "notes": ""},
                    "models": [{"results": {"bmd": 1.0}}],
                },
                "error": None,
            }
        ],
    }


def _reversed_dict_order(obj):
    if isinstance(obj, dict):
        return {k: _reversed_dict_order(v) for k, v in reversed(list(obj.items()))}
    if isinstance(obj, list):
        return [_reversed_dict_order(v) for v in obj]
    return obj


@pytest.mark.django_db
class TestFingerprintContract:
    def test_format_and_stability(self):
        inputs = _sample_inputs()
        outputs = _sample_outputs()

        value = build_fingerprint(inputs, outputs)
        assert value.startswith("BMDS-v1-sha256:")
        digest = value.split(":", 1)[1]
        assert len(digest) == 64
        assert all(c in "0123456789abcdef" for c in digest)

        # deterministic across repeated calls
        assert value == build_fingerprint(inputs, outputs)

    def test_nested_key_order_independence(self):
        inputs = _sample_inputs()
        outputs = _sample_outputs()

        i2 = _reversed_dict_order(inputs)
        o2 = _reversed_dict_order(outputs)

        assert build_fingerprint(inputs, outputs) == build_fingerprint(i2, o2)

    def test_analysis_id_excluded(self):
        inputs = _sample_inputs()
        outputs = _sample_outputs()

        fp1 = build_fingerprint(inputs, outputs)
        outputs["analysis_id"] = "22222222-2222-2222-2222-222222222222"
        fp2 = build_fingerprint(inputs, outputs)

        assert fp1 == fp2

    def test_list_order_is_significant(self):
        inputs = _sample_inputs()
        outputs = _sample_outputs()

        fp1 = build_fingerprint(inputs, outputs)

        inputs2 = deepcopy(inputs)
        inputs2["datasets"][0]["doses"] = [10, 0]
        fp2 = build_fingerprint(inputs2, outputs)

        assert fp1 != fp2

    def test_numeric_representation_1_vs_1_point_0_differs(self):
        inputs = _sample_inputs()
        outputs = _sample_outputs()

        fp1 = build_fingerprint(inputs, outputs)
        inputs2 = deepcopy(inputs)
        inputs2["options"][0]["bmr_value"] = 1.0
        fp2 = build_fingerprint(inputs2, outputs)

        assert fp1 != fp2

    def test_nonfinite_values_rejected(self):
        inputs = _sample_inputs()
        outputs = _sample_outputs()
        outputs["outputs"][0]["frequentist"]["models"][0]["results"]["bmd"] = float("nan")

        with pytest.raises(ValueError):
            build_fingerprint(inputs, outputs)

    def test_inputs_outputs_not_mutated(self):
        inputs = _sample_inputs()
        outputs = _sample_outputs()
        i0 = deepcopy(inputs)
        o0 = deepcopy(outputs)

        build_fingerprint(inputs, outputs)

        assert inputs == i0
        assert outputs == o0


@pytest.mark.django_db
class TestFingerprintLifecycleIntegration:
    def test_model_lifecycle_and_selection_change(self, complete_dichotomous):
        analysis = Analysis.objects.create(inputs=complete_dichotomous)

        # before execution
        assert analysis.analysis_fingerprint is None

        analysis.execute()
        analysis.refresh_from_db()
        fp1 = analysis.analysis_fingerprint
        assert fp1 and fp1.startswith("BMDS-v1-sha256:")

        # selection/notes are included in outputs => fingerprint changes
        analysis.outputs["outputs"][0]["frequentist"]["selected"] = {
            "model_index": 0,
            "notes": "manual selection",
        }
        analysis.save()
        analysis.refresh_from_db()
        fp2 = analysis.analysis_fingerprint
        assert fp2 != fp1

        # reset execution => unavailable
        analysis.reset_execution()
        analysis.save()
        analysis.refresh_from_db()
        assert analysis.analysis_fingerprint is None

    def test_retrieve_expected_fingerprint_contract(self):
        client = APIClient()
        analysis = Analysis.objects.get(pk="432a6083-f9aa-4de2-a71f-a6488b4c5bf1")
        detail_url = reverse("api:analysis-detail", args=(analysis.id,))

        # ordinary retrieval remains available
        response = client.get(detail_url)
        assert response.status_code == 200
        expected = response.json()["analysis_fingerprint"]
        assert expected and expected.startswith("BMDS-v1-sha256:")

        # pinned retrieval returns no-store and same serialized snapshot fingerprint
        pinned = client.get(detail_url, {"expected_fingerprint": expected})
        assert pinned.status_code == 200
        assert pinned["Cache-Control"] == "no-store"
        assert pinned.json()["analysis_fingerprint"] == expected

        # mismatch returns 409 conflict
        mismatch = client.get(detail_url, {"expected_fingerprint": expected[:-1] + "0"})
        assert mismatch.status_code == 409

    def test_retrieve_expected_fingerprint_draft_behavior(self, complete_continuous):
        client = APIClient()
        analysis = Analysis.objects.create(inputs=complete_continuous)
        detail_url = reverse("api:analysis-detail", args=(analysis.id,))

        # ordinary retrieve for draft still allowed
        response = client.get(detail_url)
        assert response.status_code == 200
        assert response.json()["analysis_fingerprint"] is None

        # pinned retrieve for draft is invalid
        pinned = client.get(detail_url, {"expected_fingerprint": "BMDS-v1-sha256:" + "0" * 64})
        assert pinned.status_code == 400
