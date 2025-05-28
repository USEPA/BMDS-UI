from pathlib import Path

import pandas as pd
import pytest

from bmds_ui.analysis.models import Analysis
from bmds_ui.analysis.reporting.docx import build_docx


def write_excel(data: dict, path: Path):
    with pd.ExcelWriter(path) as writer:
        for name, df in data.items():
            df.to_excel(writer, sheet_name=name, index=False)


@pytest.mark.django_db()
class TestAnalysis:
    def test_maybe_hanging(self):
        qs = Analysis.maybe_hanging(queryset=Analysis.objects.all())
        assert qs.count() == 1
        assert str(qs[0].id) == "bb5ada91-8f32-4a24-aedf-dcecbe5044f6"

    def test_model_class_label(self):
        a = Analysis.objects.get(id="cc3ca355-a57a-4fba-9dc3-99657562df68")
        assert a.model_class_label == "Continuous"

    def test_timestamp(self):
        a = Analysis.objects.get(id="cc3ca355-a57a-4fba-9dc3-99657562df68")
        assert str(a.timestamp) == "2021-12-15 18:42:49.109397+00:00"

    def test_delete_old_analyses(self):
        n_before = Analysis.objects.count()
        assert Analysis.objects.filter(id="1b4360dd-27ae-46f1-ad7e-45796d44be8c").exists()

        Analysis.delete_old_analyses()

        n_after = Analysis.objects.count()
        assert n_before - n_after == 1
        assert not Analysis.objects.filter(id="1b4360dd-27ae-46f1-ad7e-45796d44be8c").exists()

    def test_delete_old_unexecuted_analyses(self):
        n_before = Analysis.objects.count()
        assert Analysis.objects.filter(id="ab5ada91-8f32-4a24-aedf-dcecbe5044f6").exists()

        Analysis.delete_old_unexecuted_analyses()

        n_after = Analysis.objects.count()
        assert n_before - n_after == 1
        assert not Analysis.objects.filter(id="ab5ada91-8f32-4a24-aedf-dcecbe5044f6").exists()


@pytest.mark.django_db()
class TestExecution:
    def test_continuous(self, complete_continuous, data_path, rewrite_data_files):
        analysis = Analysis.objects.create(inputs=complete_continuous)

        assert analysis.is_finished is False
        assert analysis.has_errors is False

        analysis.execute()

        assert analysis.is_finished is True
        assert analysis.has_errors is False
        assert analysis.outputs["outputs"][0]["dataset_index"] == 0
        assert analysis.outputs["outputs"][0]["option_index"] == 0
        assert len(analysis.outputs["outputs"]) == 1
        assert len(analysis.outputs["outputs"][0]["frequentist"]["models"]) == 1
        assert len(analysis.outputs["outputs"][0]["bayesian"]["models"]) == 1
        assert analysis.errors == []

        # test reporting (for completion)
        docx = build_docx(analysis, "http://bmds-python.com")
        df = analysis.to_df()
        assert len(df) == 3

        if rewrite_data_files:
            write_excel(df, data_path / "reports/continuous.xlsx")
            (data_path / "reports/continuous.docx").write_bytes(docx.getvalue())

    def test_continuous_individual(
        self, complete_continuous_individual, data_path, rewrite_data_files
    ):
        analysis = Analysis.objects.create(inputs=complete_continuous_individual)

        assert analysis.is_finished is False
        assert analysis.has_errors is False

        analysis.execute()

        assert analysis.is_finished is True
        assert analysis.has_errors is False
        assert analysis.outputs["outputs"][0]["dataset_index"] == 0
        assert analysis.outputs["outputs"][0]["option_index"] == 0
        assert len(analysis.outputs["outputs"]) == 1
        assert len(analysis.outputs["outputs"][0]["frequentist"]["models"]) == 1
        assert len(analysis.outputs["outputs"][0]["bayesian"]["models"]) == 1
        assert analysis.errors == []

        # test reporting (for completion)
        docx = build_docx(analysis, "http://bmds-python.com")
        df = analysis.to_df()
        assert len(df) == 3

        if rewrite_data_files:
            write_excel(df, data_path / "reports/continuous_individual.xlsx")
            (data_path / "reports/continuous_individual.docx").write_bytes(docx.getvalue())

    def test_dichotomous(self, complete_dichotomous, data_path, rewrite_data_files):
        analysis = Analysis.objects.create(inputs=complete_dichotomous)

        assert analysis.is_finished is False
        assert analysis.has_errors is False

        analysis.execute()

        assert analysis.is_finished is True
        assert analysis.has_errors is False
        assert analysis.outputs["outputs"][0]["dataset_index"] == 0
        assert analysis.outputs["outputs"][0]["option_index"] == 0
        assert len(analysis.outputs["outputs"]) == 1
        assert len(analysis.outputs["outputs"][0]["frequentist"]["models"]) == 1
        assert len(analysis.outputs["outputs"][0]["bayesian"]["models"]) == 1
        assert analysis.errors == []

        # test reporting (for completion)
        docx = build_docx(analysis, "http://bmds-python.com")
        df = analysis.to_df()
        assert len(df) == 3

        if rewrite_data_files:
            write_excel(df, data_path / "reports/dichotomous.xlsx")
            (data_path / "reports/dichotomous.docx").write_bytes(docx.getvalue())

    def test_nested_dichotomous(self, bmds_complete_nd, data_path, rewrite_data_files):
        analysis = Analysis.objects.create(inputs=bmds_complete_nd)

        assert analysis.is_finished is False
        assert analysis.has_errors is False

        analysis.execute()

        assert analysis.is_finished is True
        assert analysis.has_errors is False
        assert analysis.outputs["outputs"][0]["dataset_index"] == 0
        assert analysis.outputs["outputs"][0]["option_index"] == 0
        assert len(analysis.outputs["outputs"]) == 1
        assert len(analysis.outputs["outputs"][0]["frequentist"]["models"]) == 4
        assert analysis.outputs["outputs"][0]["bayesian"] is None
        assert analysis.errors == []

        # test reporting (for completion)
        docx = build_docx(analysis, "http://bmds-python.com")
        df = analysis.to_df()
        assert len(df) == 3

        if rewrite_data_files:
            write_excel(df, data_path / "reports/nested_dichotomous.xlsx")
            (data_path / "reports/nested_dichotomous.docx").write_bytes(docx.getvalue())

    def test_multitumor(self, bmds_complete_mt, data_path, rewrite_data_files):
        analysis = Analysis.objects.create(inputs=bmds_complete_mt)

        assert analysis.is_finished is False
        assert analysis.has_errors is False

        analysis.execute()

        assert analysis.is_finished is True
        assert analysis.has_errors is False
        assert len(analysis.outputs["outputs"]) == 1
        assert len(analysis.outputs["outputs"][0]["frequentist"]["results"]["models"]) == 3
        assert len(analysis.outputs["outputs"][0]["frequentist"]["results"]["models"][0]) == 1
        assert len(analysis.outputs["outputs"][0]["frequentist"]["results"]["models"][1]) == 4
        assert analysis.outputs["outputs"][0]["bayesian"] is None
        assert analysis.errors == []

        # test reporting (for completion)
        docx = build_docx(analysis, "http://bmds-python.com")
        df = analysis.to_df()
        assert len(df) == 3

        if rewrite_data_files:
            write_excel(df, data_path / "reports/multitumor.xlsx")
            (data_path / "reports/multitumor.docx").write_bytes(docx.getvalue())
