import tempfile
from pathlib import Path

import pytest

from bmds_ui.desktop.components import database_form


def test_additional_path_checks():
    # cannot write to this path
    p = Path("/root/test.txt")
    with pytest.raises(ValueError, match="Cannot create path"):
        database_form.additional_path_checks(p)

    # non sqlite file
    with tempfile.NamedTemporaryFile(mode="w") as f:
        f.write("test")
        f.flush()
        p = Path(f.name)
        with pytest.raises(ValueError, match="Cannot edit database"):
            database_form.additional_path_checks(p)
