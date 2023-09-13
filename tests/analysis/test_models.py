from pathlib import Path

import pandas as pd
import pytest

from bmds_server.analysis.models import Analysis
from bmds_server.analysis.reporting.docx import build_docx


def write_excel(data: dict, path: Path):
    with pd.ExcelWriter(path) as writer:
        for name, df in data.items():
            df.to_excel(writer, sheet_name=name, index=False)


@pytest.mark.django_db()
class TestBmds3Execution:
    def test_continuous(self, bmds3_complete_continuous, data_path, rewrite_data_files):
        analysis = Analysis.objects.create(inputs=bmds3_complete_continuous)

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
            write_excel(df, data_path / "continuous.xlsx")
            (data_path / "continuous.docx").write_bytes(docx.getvalue())

    def test_continuous_individual(
        self, bmds3_complete_continuous_individual, data_path, rewrite_data_files
    ):
        analysis = Analysis.objects.create(inputs=bmds3_complete_continuous_individual)

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
            write_excel(df, data_path / "continuous_individual.xlsx")
            (data_path / "continuous_individual.docx").write_bytes(docx.getvalue())

    def test_dichotomous(self, bmds3_complete_dichotomous, data_path, rewrite_data_files):
        analysis = Analysis.objects.create(inputs=bmds3_complete_dichotomous)

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
            write_excel(df, data_path / "dichotomous.xlsx")
            (data_path / "dichotomous.docx").write_bytes(docx.getvalue())

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
            write_excel(df, data_path / "nested_dichotomous.xlsx")
            (data_path / "nested_dichotomous.docx").write_bytes(docx.getvalue())

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
            write_excel(df, data_path / "multitumor.xlsx")
            (data_path / "multitumor.docx").write_bytes(docx.getvalue())
