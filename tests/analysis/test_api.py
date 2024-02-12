import json
from io import BytesIO

import docx
import pandas as pd
import pytest
from bmds.recommender import RecommenderSettings
from django.urls import reverse
from rest_framework.test import APIClient

from bmds_server.analysis.models import Analysis


def check_error(response: dict, type: str, loc: list, msg: str):
    assert response["type"] == type
    assert response["loc"] == loc
    assert response["msg"] == msg


@pytest.mark.django_db
class TestAnalysisViewSet:
    def test_auth(self, bmds3_complete_continuous):
        """
        Check API auth cases.

        - For write operations, CSRF required for unauthenticated
        - For read operations, CSRF is not required
        - Token auth should work fine for all read/write operations.
        """
        analysis = Analysis.objects.create()
        write_url = analysis.get_api_patch_inputs_url()
        read_url = analysis.get_api_url()
        payload = {
            "editKey": analysis.password,
            "data": bmds3_complete_continuous,
        }

        # client; no CSRF
        client = APIClient(enforce_csrf_checks=True)
        client.defaults.update(SERVER_NAME="testserver")

        # can GET from api w/o csrftoken
        response = client.get(read_url)
        assert response.status_code == 200

        # cannot PATCH from api w/o csrftoken
        response = client.patch(write_url, payload, format="json")
        assert response.status_code == 403

        # setup token client
        client_token = APIClient(
            enforce_csrf_checks=True,
            SERVER_NAME="testserver",
            HTTP_AUTHORIZATION="Token cef32b9abcbe1a6e9c8460099403e9cd77e12c79",
        )

        # setup CSRF client
        client_csrf = APIClient(enforce_csrf_checks=True, SERVER_NAME="testserver")
        response = client_csrf.get(analysis.get_edit_url())
        client_csrf.defaults.update(HTTP_X_CSRFTOKEN=response.cookies["csrftoken"].value)

        for client in (client_token, client_csrf):
            response = client.get(read_url)
            assert response.status_code == 200

            response = client.patch(write_url, payload, format="json")
            assert response.status_code == 200

    def test_patch_auth(self):
        client = APIClient()
        analysis = Analysis.objects.create()
        url = analysis.get_api_patch_inputs_url()

        # check HTTP verbs
        response = client.post(url, {}, format="json")
        assert response.status_code == 405
        assert response.json() == {"detail": 'Method "POST" not allowed.'}

        # check permission
        response = client.patch(url, {}, format="json")
        assert response.status_code == 403
        assert response.json() == {"detail": "You do not have permission to perform this action."}
        assert (
            client.patch(url, {"editKey": analysis.password[:2]}, format="json").status_code == 403
        )

        # check data
        payload = {"editKey": analysis.password}
        response = client.patch(url, payload, format="json")
        assert response.status_code == 400
        assert response.json() == ["A `data` object is required"]

    def test_patch_partial(self):
        client = APIClient()
        analysis = Analysis.objects.create()
        url = analysis.get_api_patch_inputs_url()

        payload = {
            "editKey": analysis.password,
            "data": {"bmds_version": "BMDS330", "dataset_type": "C"},
        }
        response = client.patch(url, payload, format="json")
        assert response.status_code == 400
        check_error(
            json.loads(response.json()[0])[0],
            type="missing",
            loc=["datasets"],
            msg="Field required",
        )

        payload = {
            "editKey": analysis.password,
            "data": {"bmds_version": "BMDS330", "dataset_type": "C"},
            "partial": True,
        }
        response = client.patch(url, payload, format="json")
        assert response.status_code == 200
        assert response.json()["inputs"] == payload["data"]

        payload["data"] = {
            "bmds_version": "BMDS330",
            "dataset_type": "C",
            "models": {"frequentist_restricted": ["ZZZ"]},
        }
        response = client.patch(url, payload, format="json")
        assert response.status_code == 400
        check_error(
            json.loads(response.json()[0])[0],
            type="value_error",
            loc=[],
            msg="Value error, Invalid model(s) in frequentist_restricted: ZZZ",
        )

        payload["data"] = {
            "bmds_version": "BMDS330",
            "dataset_type": "C",
            "models": {"frequentist_restricted": ["Power"]},
            "recommender": RecommenderSettings.build_default().model_dump(),
        }
        response = client.patch(url, payload, format="json")
        assert response.status_code == 200
        assert response.json()["inputs"] == payload["data"]

    def test_patch_complete_continuous(self, bmds3_complete_continuous):
        client = APIClient()
        analysis = Analysis.objects.create()
        url = analysis.get_api_patch_inputs_url()

        # complete bmds3 continuous
        payload = {"editKey": analysis.password, "data": bmds3_complete_continuous}
        response = client.patch(url, payload, format="json")
        assert response.status_code == 200
        assert response.json()["inputs"] == payload["data"]

    def test_optional_recommender(self, bmds3_complete_continuous):
        client = APIClient()
        analysis = Analysis.objects.create()
        url = analysis.get_api_patch_inputs_url()

        # complete bmds3 continuous
        payload = {"editKey": analysis.password, "data": bmds3_complete_continuous}
        del payload["data"]["recommender"]
        response = client.patch(url, payload, format="json")
        assert response.status_code == 200
        assert response.json()["inputs"] == payload["data"]

    def test_patch_complete_dichotomous(self, bmds3_complete_dichotomous):
        client = APIClient()
        analysis = Analysis.objects.create()
        url = analysis.get_api_patch_inputs_url()

        # complete bmds3 dichotomous
        payload = {"editKey": analysis.password, "data": bmds3_complete_dichotomous}
        response = client.patch(url, payload, format="json")
        assert response.status_code == 200
        assert response.json()["inputs"] == payload["data"]

    def test_execute(self, bmds3_complete_dichotomous):
        client = APIClient()
        analysis = Analysis.objects.create(inputs=bmds3_complete_dichotomous)
        assert analysis.started is None
        url = analysis.get_api_execute_url()

        # invalid key
        payload = {"editKey": analysis.password + "123"}
        response = client.post(url, payload, format="json")
        assert response.status_code == 403

        # valid key
        payload = {"editKey": analysis.password}
        response = client.post(url, payload, format="json")
        assert response.status_code == 200
        bmd = response.data["outputs"]["outputs"][0]["frequentist"]["models"][0]["results"]["bmd"]
        assert response.data["is_finished"] is True
        assert response.data["has_errors"] is False
        assert bmd == pytest.approx(164.3, rel=0.05)

    def test_reset_execute(self, bmds3_complete_dichotomous):
        client = APIClient()
        analysis = Analysis.objects.create(inputs=bmds3_complete_dichotomous)
        analysis.execute()
        url = analysis.get_api_execute_reset_url()

        # invalid key
        payload = {"editKey": analysis.password + "123"}
        response = client.post(url, payload, format="json")
        assert response.status_code == 403

        # valid key
        payload = {"editKey": analysis.password}
        response = client.post(url, payload, format="json")
        assert response.status_code == 200
        assert response.data["is_finished"] is False
        assert response.data["has_errors"] is False
        assert response.data["outputs"] == {}

    def test_model_selection(self, bmds3_complete_dichotomous):
        client = APIClient()
        analysis = Analysis.objects.create(inputs=bmds3_complete_dichotomous)
        analysis.execute()

        url = analysis.get_api_url() + "select-model/"
        payload = {
            "data": {
                "dataset_index": 0,
                "option_index": 0,
                "selected": {"model_index": 0, "notes": "notes"},
            },
        }

        # invalid key
        payload["editKey"] = analysis.password + "123"
        response = client.post(url, payload, format="json")
        assert response.status_code == 403

        # selected model
        payload["editKey"] = analysis.password
        response = client.post(url, payload, format="json")
        assert response.status_code == 200
        value = response.data["outputs"]["outputs"][0]["frequentist"]["selected"]
        assert value == {"notes": "notes", "model_index": 0}

        # deselect model
        payload["data"]["selected"] = {"model_index": None, "notes": "no notes"}
        response = client.post(url, payload, format="json")
        assert response.status_code == 200
        value = response.data["outputs"]["outputs"][0]["frequentist"]["selected"]
        assert value == {"model_index": None, "notes": "no notes"}


@pytest.mark.django_db
class TestPolyKViewSet:
    def test_create(self, polyk_dataset):
        client = APIClient()
        url = reverse("api:polyk-list")
        response = client.post(url, polyk_dataset, format="json")
        assert response.status_code == 200
        assert list(response.json().keys()) == ["df", "df2"]

    def test_excel(self, polyk_dataset):
        client = APIClient()
        url = reverse("api:polyk-excel")
        response = client.post(url, polyk_dataset, format="json")
        assert response.status_code == 200
        # ensure that response is a valid workbook with two worksheets
        data = pd.read_excel(response.content, sheet_name=["adjusted", "summary"])
        assert isinstance(data["adjusted"], pd.DataFrame)
        assert isinstance(data["summary"], pd.DataFrame)

    def test_word(self, polyk_dataset):
        client = APIClient()
        url = reverse("api:polyk-word")
        response = client.post(url, polyk_dataset, format="json")
        assert response.status_code == 200
        # assert docx loads
        doc = docx.Document(BytesIO(response.content))
        assert isinstance(doc, docx.document.Document)
