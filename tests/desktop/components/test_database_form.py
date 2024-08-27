import sys
import tempfile
from pathlib import Path

import pytest

from bmds_ui.desktop.components import database_form
from bmds_ui.desktop.config import Database


def test_additional_path_checks():
    # cannot write to this path

    match = None
    if sys.platform == "darwin":
        match = "Cannot create path"
    elif sys.platform == "linux":
        match = "Permission denied"
    if match:
        p = Path("/root/test.txt")
        with pytest.raises(ValueError, match=match):
            database_form.additional_path_checks(p)

    # non sqlite file
    with tempfile.NamedTemporaryFile(mode="w") as f:
        f.write("test")
        f.flush()
        p = Path(f.name)
        with pytest.raises(ValueError, match="Cannot edit database"):
            database_form.additional_path_checks(p)


def test_check_duplicates():
    existing = [
        Database(name="a", path=Path("a.db")),
        Database(name="b", path=Path("b.db")),
    ]

    # check pass; new filename
    new_db = Database(name="c", path=Path("c.db"))
    assert database_form.check_duplicates(existing, new_db) is None

    # check pass; editing existing file
    new_db = existing[0].model_copy()
    new_db.name = "d"
    assert database_form.check_duplicates(existing, new_db) is None

    # check failure; new database with same path
    new_db = Database(name="b", path=Path("b.db"))
    with pytest.raises(
        ValueError, match=r"An existing project \([\w]+\) already exists with this filename"
    ):
        database_form.check_duplicates(existing, new_db)

    # check failure; new database with same name
    new_db = Database(name="b", path=Path("d.db"))
    with pytest.raises(ValueError, match="An existing project already exists with this name"):
        database_form.check_duplicates(existing, new_db)
